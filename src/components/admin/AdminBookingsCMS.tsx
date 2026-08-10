import React, { useState, useEffect } from 'react';
import { User, CourseBooking } from '../../types';
import { getBookings, updateBookingStatus } from '../../services/bookingService';
import { CreditCard, MapPin, Phone, MessageCircle, CheckCircle2, XCircle, Clock, ShieldCheck, Download, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AdminBookingsCMSProps {
  currentUser: User | null;
}

export const AdminBookingsCMS: React.FC<AdminBookingsCMSProps> = ({ currentUser }) => {
  const [bookings, setBookings] = useState<CourseBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { isArabic, dir } = useLanguage();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (booking: CourseBooking) => {
    if (window.confirm('Are you sure you want to verify this payment and confirm the booking?')) {
      try {
        await updateBookingStatus(booking.id, {
          paymentStatus: 'VERIFIED',
          bookingStatus: 'BOOKING_CONFIRMED',
          verifiedAt: new Date().toISOString(),
          verifiedBy: currentUser?.id
        });
        
        // Refresh
        fetchBookings();
      } catch (error) {
        console.error('Error verifying payment:', error);
        alert('Failed to verify payment.');
      }
    }
  };

  const handleRejectBooking = async (booking: CourseBooking) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      try {
        await updateBookingStatus(booking.id, {
          paymentStatus: 'FAILED',
          bookingStatus: 'REJECTED'
        });
        
        // Refresh
        fetchBookings();
      } catch (error) {
        console.error('Error rejecting booking:', error);
        alert('Failed to reject booking.');
      }
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.phone.includes(searchTerm) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'PAYMENT_PENDING':
        return <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">Pending</span>;
      case 'PAYMENT_SUBMITTED':
      case 'PAYMENT_VERIFICATION':
        return <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">Verification Needed</span>;
      case 'VERIFIED':
      case 'BOOKING_CONFIRMED':
      case 'ENROLLED':
        return <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">Confirmed</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded bg-slate-500/20 text-slate-400 text-xs font-bold border border-slate-500/30">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            Bookings & Payments
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage course booking requests and verify payments.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, customer, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
            No bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-4 font-bold rounded-tl-xl">Booking ID</th>
                  <th className="p-4 font-bold">Student</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Course / Price</th>
                  <th className="p-4 font-bold">Method</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-slate-300">ST-{booking.id.substring(0,5).toUpperCase()}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{booking.studentName}</div>
                      <div className="text-xs text-slate-400">Parent: {booking.customerName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300 flex items-center gap-1"><Phone className="w-3 h-3" /> {booking.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-300">{booking.courseId}</div>
                      <div className="text-emerald-400 font-extrabold text-xs">{booking.finalPriceSnapshot} {booking.currency}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-slate-300">
                        {booking.paymentMethod === 'INSTAPAY' && <CreditCard className="w-4 h-4 text-purple-400" />}
                        {booking.paymentMethod === 'VODAFONE_CASH' && <Phone className="w-4 h-4 text-red-500" />}
                        {booking.paymentMethod === 'IN_PERSON' && <MapPin className="w-4 h-4 text-emerald-500" />}
                        <span>{booking.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(booking.bookingStatus)}
                        {getStatusBadge(booking.paymentStatus)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {(booking.bookingStatus !== 'BOOKING_CONFIRMED' && booking.bookingStatus !== 'REJECTED') && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleVerifyPayment(booking)}
                            className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition"
                            title="Verify Payment"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRejectBooking(booking)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                            title="Reject Booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {booking.bookingStatus === 'BOOKING_CONFIRMED' && (
                        <span className="text-emerald-400 flex items-center justify-end gap-1 font-bold text-xs">
                          <ShieldCheck className="w-4 h-4" /> Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
