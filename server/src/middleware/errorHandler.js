export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue ? err.keyValue[field] : '';
    if (field === 'username') {
      message = `Username '${value}' is already taken. Please choose another.`;
    } else if (field === 'playerId') {
      message = `Player ID '${value}' already exists.`;
    } else if (err.keyPattern && err.keyPattern.team && err.keyPattern.jerseyNumber) {
      message = `Jersey number ${err.keyValue.jerseyNumber} is already assigned to another active player in this team.`;
    } else if (err.keyPattern && err.keyPattern.team && err.keyPattern.date && err.keyPattern.sessionLabel) {
      message = `A session labeled '${err.keyValue.sessionLabel}' already exists for this team on ${err.keyValue.date}.`;
    } else if (err.keyPattern && err.keyPattern.session && err.keyPattern.player) {
      message = `Attendance for this player has already been recorded in this session.`;
    } else {
      message = `Duplicate record detected for ${field}: ${value}`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier: ${err.value}`;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
