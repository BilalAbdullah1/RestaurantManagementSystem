import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../../../utils/axiosConfig';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  challanId: string | null;
  studentName: string;
  netPayable: number;
  onSuccess: () => void;
}

export default function ReceivePaymentModal({ isOpen, onClose, challanId, studentName, netPayable, onSuccess }: ReceivePaymentModalProps) {
  const [amount, setAmount] = useState<number>(netPayable);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [remarks, setRemarks] = useState<string>('');
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(netPayable);
      setPaymentMethod('Cash');
      setRemarks('');
      setUseWallet(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setMobileNumber('');
    }
  }, [isOpen, netPayable]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challanId) return;

    if (amount <= 0 && !useWallet) {
      Swal.fire('Error', 'Amount must be greater than zero, or select use wallet balance.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount_received: amount,
        payment_method: paymentMethod,
        remarks: remarks,
        use_wallet_balance: useWallet
      };

      const res = await api.put(`/feechallans/${challanId}/pay`, payload);
      Swal.fire('Success', res.data.message || 'Payment received successfully.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Could not process payment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Stripe', label: 'Stripe (Credit / Debit Card)' },
    { value: 'Razorpay', label: 'Razorpay Online' },
    { value: 'JazzCash', label: 'JazzCash / EasyPaisa Mobile Wallet' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[99998] transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[99999] transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Receive / Process Payment</h3>
            <p className="text-sm text-gray-500">Student: {studentName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm border border-gray-100 dark:border-gray-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Net Payable Balance</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Rs. {netPayable.toLocaleString()}</p>
          </div>

          <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label required>Amount Received (Rs)</Label>
              <input 
                type="number" 
                required 
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white transition-shadow"
              />
              <p className="text-xs text-gray-500 mt-1">Enter an amount less than payable for partial payment, or greater for wallet top-up.</p>
            </div>

            <div>
              <Label required>Payment Method / Gateway</Label>
              <SearchableSelect 
                options={paymentOptions} 
                value={paymentMethod} 
                onChange={setPaymentMethod} 
                placeholder="Select method" 
              />
            </div>

            {(paymentMethod === 'Stripe' || paymentMethod === 'Razorpay') && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">{paymentMethod} Card Details</p>
                <div>
                  <Label required>Card Number</Label>
                  <input 
                    type="text" 
                    placeholder="4242 •••• •••• 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label required>MM/YY</Label>
                    <input 
                      type="text" 
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label required>CVC</Label>
                    <input 
                      type="text" 
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'JazzCash' && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-900/30 space-y-3">
                <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase">JazzCash / EasyPaisa Wallet</p>
                <div>
                  <Label required>Mobile Account Number</Label>
                  <input 
                    type="text" 
                    placeholder="03001234567"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="useWallet"
                checked={useWallet}
                onChange={(e) => setUseWallet(e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="useWallet" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Deduct from student's Wallet Balance (if available)
              </label>
            </div>

            <div>
              <Label>Remarks (Optional)</Label>
              <textarea 
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="E.g. Paid via check #123456 or Online Transaction"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white transition-shadow"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end space-x-3">
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="payment-form" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </div>
      </div>
    </>
  );
}
