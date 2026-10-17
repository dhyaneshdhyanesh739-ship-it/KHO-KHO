import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitSuccess(false);

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, Subject, and Message).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.content.sendContact(formData);
      if (res && res.success) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setErrorMessage(res.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to send message. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-court-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-navy-800 text-xs font-bold uppercase tracking-wider mb-3">
                Communications & Recruitment
              </div>
              <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
                Connect With the Coaching Staff
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Have questions regarding team trials, student-athlete recruitment, tournament fixtures, or facility scheduling? Reach out directly to our athletics directorate.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Arena & Sports Complex</h4>
                  <p className="text-sm font-bold text-navy-900">National Kho-Kho Court & Athletics Pavilion</p>
                  <p className="text-xs text-slate-500">Sports Directorate, University Enclave</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Electronic Mail</h4>
                  <p className="text-sm font-bold text-navy-900">athletics@khokhoarena.org</p>
                  <p className="text-xs text-slate-500">Official Directorate Inquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-sportsGreen-light text-sportsGreen-dark flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sports Directorate Desk</h4>
                  <p className="text-sm font-bold text-navy-900">+91 (022) 2890-KHO-KHO</p>
                  <p className="text-xs text-slate-500">Monday to Saturday • 07:00 AM – 06:30 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Functional Contact Form */}
          <div className="lg:col-span-7">
            <div className="card-premium p-8 shadow-card">
              <h3 className="font-editorial text-2xl font-bold text-navy-900 mb-2">
                Send an Official Message
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                All inquiries are logged directly in our database and forwarded to the head coaches.
              </p>

              {/* Success Notification */}
              {submitSuccess && (
                <div className="p-4 rounded-2xl bg-sportsGreen-light border border-emerald-300 text-sportsGreen-dark mb-6 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Message Delivered Successfully!</h5>
                    <p className="text-xs mt-0.5">
                      Our coaching administration has received your inquiry. We will contact you via email or phone shortly.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Transmission Error</h5>
                    <p className="text-xs mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kulkarni"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Team Trial Eligibility"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your detailed query or athlete profile details..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 text-sm outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-sm shadow-md"
                >
                  {isSubmitting ? (
                    'Transmitting Message...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Official Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
