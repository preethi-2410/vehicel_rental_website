import React from 'react';
import { FaPrint } from 'react-icons/fa';

const Receipt = ({ receipt }) => {
  if (!receipt) {
    return null;
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{receipt.company.name}</h1>
            <p className="text-sm text-gray-500">{receipt.company.address}</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="print:hidden text-blue-600 hover:text-blue-800"
          >
            <FaPrint size={20} />
          </button>
        </div>

        {/* Receipt Details */}
        <div className="mb-6 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Receipt Number</p>
            <p className="font-medium">{receipt.receiptNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{formatDate(receipt.date)}</p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-green-50 text-green-800 px-4 py-2 rounded-md mb-6 font-medium">
          {receipt.status}
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <h3 className="text-gray-500 text-sm mb-2">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Name</p>
              <p className="font-medium">{receipt.customer.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="font-medium">{receipt.customer.email}</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="mb-6">
          <h3 className="text-gray-500 text-sm mb-2">Booking Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Booking ID</p>
              <p className="font-medium">{receipt.booking.id}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Vehicle</p>
              <p className="font-medium">{receipt.booking.vehicle}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Period</p>
              <p className="font-medium">
                {formatDate(receipt.booking.startDate)} - {formatDate(receipt.booking.endDate)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Duration</p>
              <p className="font-medium">{receipt.booking.duration}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mb-6">
          <h3 className="text-gray-500 text-sm mb-2">Payment Summary</h3>
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2">Vehicle Rental</td>
                <td className="py-2 text-right">{formatCurrency(receipt.payment.subtotal)}</td>
              </tr>
              <tr>
                <td className="py-2">Tax (18% GST)</td>
                <td className="py-2 text-right">{formatCurrency(receipt.payment.tax)}</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Total</td>
                <td className="py-2 text-right">{formatCurrency(receipt.payment.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Info */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Payment ID</p>
              <p className="font-medium">{receipt.payment.id}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Payment Method</p>
              <p className="font-medium">{receipt.payment.method}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>For any queries, please contact us at {receipt.company.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt; 