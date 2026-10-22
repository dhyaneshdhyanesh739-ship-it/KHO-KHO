import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

/**
 * Translates MongoDB style filters into Prisma where clauses.
 */
export function translateFilter(filter = {}) {
  if (!filter || typeof filter !== 'object') return {};

  const where = {};

  for (const [key, val] of Object.entries(filter)) {
    if (val === undefined) continue;

    // Handle Logical Operators
    if (key === '$or' && Array.isArray(val)) {
      where.OR = val.map((sub) => translateFilter(sub));
      continue;
    }
    if (key === '$and' && Array.isArray(val)) {
      where.AND = val.map((sub) => translateFilter(sub));
      continue;
    }

    // Map _id to id
    const targetKey = key === '_id' ? 'id' : key;

    // Handle Regex
    if (val instanceof RegExp) {
      where[targetKey] = {
        contains: val.source.replace(/^\^|\$$/g, ''),
        mode: val.flags.includes('i') ? 'insensitive' : 'default',
      };
      continue;
    }

    // Handle operator objects: { $in, $nin, $gte, $lte, $gt, $lt, $ne }
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      // Check if it's an operator object
      const hasOperators = Object.keys(val).some((k) => k.startsWith('$'));
      if (hasOperators) {
        const opClause = {};
        for (const [op, opVal] of Object.entries(val)) {
          if (op === '$in') opClause.in = Array.isArray(opVal) ? opVal.map((v) => (v && v._id ? String(v._id) : String(v))) : [];
          else if (op === '$nin') opClause.notIn = Array.isArray(opVal) ? opVal.map((v) => (v && v._id ? String(v._id) : String(v))) : [];
          else if (op === '$gt') opClause.gt = opVal;
          else if (op === '$gte') opClause.gte = opVal;
          else if (op === '$lt') opClause.lt = opVal;
          else if (op === '$lte') opClause.lte = opVal;
          else if (op === '$ne') opClause.not = opVal;
          else if (op === '$regex') {
            opClause.contains = typeof opVal === 'string' ? opVal.replace(/^\^|\$$/g, '') : opVal.source;
            opClause.mode = 'insensitive';
          }
        }
        where[targetKey] = opClause;
        continue;
      }
    }

    // If value has an _id property (like a mongoose document or ObjectId)
    if (val && typeof val === 'object' && val._id) {
      where[targetKey] = String(val._id);
      continue;
    }

    // Primitive values
    where[targetKey] = val;
  }

  return where;
}

/**
 * Translates MongoDB style sort: { jerseyNumber: 1, createdAt: -1 } to Prisma orderBy.
 */
export function translateSort(sortObj) {
  if (!sortObj) return undefined;
  if (typeof sortObj === 'string') {
    // e.g. "-createdAt" or "jerseyNumber"
    const isDesc = sortObj.startsWith('-');
    const field = isDesc ? sortObj.slice(1) : sortObj;
    return { [field === '_id' ? 'id' : field]: isDesc ? 'desc' : 'asc' };
  }
  const orderBy = [];
  for (const [field, direction] of Object.entries(sortObj)) {
    const key = field === '_id' ? 'id' : field;
    const dir = direction === -1 || direction === 'desc' || direction === 'DESC' ? 'desc' : 'asc';
    orderBy.push({ [key]: dir });
  }
  return orderBy.length === 1 ? orderBy[0] : orderBy;
}

/**
 * Wraps raw Prisma records into Mongoose-compatible document instances.
 */
export function wrapDocument(modelName, raw) {
  if (!raw) return null;

  const doc = { ...raw };

  // Set _id and id interchangeably
  if (doc.id) {
    doc._id = doc.id;
  }

  // Ensure JSON fields are parsed objects/arrays
  for (const [k, v] of Object.entries(doc)) {
    if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
      try {
        doc[k] = JSON.parse(v);
      } catch (e) {
        // keep as is
      }
    }
  }

  // User-specific helpers
  if (modelName === 'user') {
    doc.comparePassword = async function (candidatePassword) {
      if (!this.passwordHash) return false;
      return bcrypt.compare(candidatePassword, this.passwordHash);
    };
  }

  // Generic document methods
  doc.toObject = function () {
    const obj = { ...this };
    delete obj.save;
    delete obj.toObject;
    delete obj.toJSON;
    delete obj.comparePassword;
    return obj;
  };

  doc.toJSON = function () {
    const obj = this.toObject();
    if (modelName === 'user') {
      delete obj.passwordHash;
    }
    return obj;
  };

  // Implement .save()
  doc.save = async function () {
    const updateData = { ...this };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.save;
    delete updateData.toObject;
    delete updateData.toJSON;
    delete updateData.comparePassword;

    const updated = await prisma[modelName].update({
      where: { id: this.id },
      data: updateData,
    });
    Object.assign(this, wrapDocument(modelName, updated));
    return this;
  };

  return doc;
}

/**
 * Chainable Query Builder mimicking Mongoose queries (find, findOne, findById)
 */
export class MongooseQuery {
  constructor(modelName, operation, initialFilter = {}) {
    this.modelName = modelName;
    this.operation = operation; // 'find', 'findOne', 'findById', 'count'
    this.initialFilter = initialFilter;
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._populateList = [];
    this._select = null;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  skip(n) {
    this._skip = parseInt(n, 10) || 0;
    return this;
  }

  limit(n) {
    this._limit = parseInt(n, 10);
    return this;
  }

  populate(path, select) {
    if (typeof path === 'string') {
      this._populateList.push({ path, select });
    } else if (Array.isArray(path)) {
      this._populateList.push(...path);
    }
    return this;
  }

  select(fields) {
    this._select = fields;
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    const delegate = prisma[this.modelName];
    const where = translateFilter(this.initialFilter);

    if (this.operation === 'count') {
      return delegate.count({ where });
    }

    if (this.operation === 'findById') {
      const id = String(this.initialFilter);
      const res = await delegate.findUnique({ where: { id } });
      const doc = wrapDocument(this.modelName, res);
      if (doc && this._populateList.length > 0) {
        await this._applyPopulate([doc]);
      }
      return doc;
    }

    if (this.operation === 'findOne') {
      const args = { where };
      if (this._sort) args.orderBy = translateSort(this._sort);
      const res = await delegate.findFirst(args);
      const doc = wrapDocument(this.modelName, res);
      if (doc && this._populateList.length > 0) {
        await this._applyPopulate([doc]);
      }
      return doc;
    }

    // Default: find
    const args = { where };
    if (this._sort) args.orderBy = translateSort(this._sort);
    if (this._skip) args.skip = this._skip;
    if (this._limit) args.take = this._limit;

    const list = await delegate.findMany(args);
    const docs = list.map((item) => wrapDocument(this.modelName, item));

    if (this._populateList.length > 0 && docs.length > 0) {
      await this._applyPopulate(docs);
    }

    return docs;
  }

  async _applyPopulate(docs) {
    for (const pop of this._populateList) {
      const { path, select } = pop;
      // Handle playerRef on user
      if (path === 'playerRef' && this.modelName === 'user') {
        const ids = [...new Set(docs.map((d) => d.playerRef).filter(Boolean))];
        if (ids.length) {
          const players = await prisma.player.findMany({ where: { id: { in: ids } } });
          const map = new Map(players.map((p) => [p.id, wrapDocument('player', p)]));
          for (const d of docs) {
            d.playerRef = map.get(d.playerRef) || null;
          }
        }
      }
      // Handle userRef on player
      else if (path === 'userRef' && this.modelName === 'player') {
        const ids = [...new Set(docs.map((d) => d.userRef).filter(Boolean))];
        if (ids.length) {
          const users = await prisma.user.findMany({ where: { id: { in: ids } } });
          const map = new Map(users.map((u) => [u.id, wrapDocument('user', u)]));
          for (const d of docs) {
            d.userRef = map.get(d.userRef) || null;
          }
        }
      }
      // Handle author on announcement
      else if (path === 'author' && this.modelName === 'announcement') {
        const ids = [...new Set(docs.map((d) => d.author).filter(Boolean))];
        if (ids.length) {
          const users = await prisma.user.findMany({ where: { id: { in: ids } } });
          const map = new Map(users.map((u) => [u.id, wrapDocument('user', u)]));
          for (const d of docs) {
            d.author = map.get(d.author) || null;
          }
        }
      }
      // Handle player / session on attendance
      else if (path === 'player' && (this.modelName === 'attendanceRecord' || this.modelName === 'attendancerecord')) {
        const ids = [...new Set(docs.map((d) => d.player).filter(Boolean))];
        if (ids.length) {
          const players = await prisma.player.findMany({ where: { id: { in: ids } } });
          const map = new Map(players.map((p) => [p.id, wrapDocument('player', p)]));
          for (const d of docs) {
            d.player = map.get(d.player) || null;
          }
        }
      }
    }
  }

  // Makes MongooseQuery directly awaitable
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

/**
 * Creates a Model Adapter that replaces Mongoose Model
 */
export function createModelAdapter(modelName) {
  const delegate = prisma[modelName];

  return {
    find(filter = {}) {
      return new MongooseQuery(modelName, 'find', filter);
    },

    findOne(filter = {}) {
      return new MongooseQuery(modelName, 'findOne', filter);
    },

    findById(id) {
      return new MongooseQuery(modelName, 'findById', id);
    },

    countDocuments(filter = {}) {
      return new MongooseQuery(modelName, 'count', filter);
    },

    async create(data) {
      if (Array.isArray(data)) {
        return this.insertMany(data);
      }

      const clean = { ...data };
      if (clean._id) {
        clean.id = String(clean._id);
        delete clean._id;
      }
      const created = await delegate.create({ data: clean });
      return wrapDocument(modelName, created);
    },

    async findByIdAndUpdate(id, update, options = {}) {
      const cleanUpdate = { ...update };
      if (cleanUpdate.$set) {
        Object.assign(cleanUpdate, cleanUpdate.$set);
        delete cleanUpdate.$set;
      }
      delete cleanUpdate._id;
      delete cleanUpdate.id;

      const updated = await delegate.update({
        where: { id: String(id) },
        data: cleanUpdate,
      });
      return wrapDocument(modelName, updated);
    },

    async findByIdAndDelete(id) {
      try {
        const deleted = await delegate.delete({
          where: { id: String(id) },
        });
        return wrapDocument(modelName, deleted);
      } catch (e) {
        return null;
      }
    },

    async findOneAndDelete(filter) {
      try {
        const where = translateFilter(filter);
        const item = await delegate.findFirst({ where });
        if (!item) return null;
        await delegate.delete({ where: { id: item.id } });
        return wrapDocument(modelName, item);
      } catch (e) {
        return null;
      }
    },

    async deleteMany(filter = {}) {
      const where = translateFilter(filter);
      const res = await delegate.deleteMany({ where });
      return { deletedCount: res.count };
    },

    async insertMany(data) {
      if (!Array.isArray(data) || data.length === 0) return [];
      const cleanList = data.map((item) => {
        const clean = { ...item };
        if (clean._id) {
          clean.id = String(clean._id);
          delete clean._id;
        }
        return clean;
      });
      await delegate.createMany({ data: cleanList });
      return cleanList.map((c) => wrapDocument(modelName, c));
    },
  };
}
