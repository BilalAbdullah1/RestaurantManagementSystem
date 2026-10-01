import React, { useState } from 'react';
import { Modal } from '../../../components/ui/modal';
import Button from '../../../components/ui/button/Button';
import InputField from '../../../components/form/input/InputField';
import { PendingFee } from '../ParentPortalService';
import { CreditCard, Smartphone, Banknote, CheckCircle, Download, ShieldCheck, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../utils/axiosConfig';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  payingChallans: PendingFee[];
  onPaymentSuccess: () => void;
  calculateLateFee: (dueDate: string) => number;
}

const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  payingChallans,
  onPaymentSuccess,
  calculateLateFee
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_wallet' | 'bank'>('card');
  const [selectedWallet, setSelectedWallet] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // OTP Simulation State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  // Processing States
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [bankReceiptUrl, setBankReceiptUrl] = useState('');

  const totalAmount = payingChallans.reduce((sum, f) => sum + f.amount + calculateLateFee(f.due_date), 0);

  // --- HANDLERS ---

  const handleSendOtp = () => {
    if (mobileNumber.length < 11) {
      Swal.fire('Error', 'Please enter a valid 11-digit mobile number', 'error');
      return;
    }
    setOtpSent(true);
    // In a real scenario, this hits an endpoint to trigger USSD / OTP.
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploadingReceipt(true);
    try {
      const res = await api.post('/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data.url;
      setBankReceiptUrl(newUrl);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Receipt upload failed', 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations based on method
    if (paymentMethod === 'mobile_wallet' && otp.length < 4) {
      Swal.fire('Error', 'Please enter the 4-digit OTP', 'error');
      return;
    }
    if (paymentMethod === 'bank' && !bankReceiptUrl) {
      Swal.fire('Error', 'Please upload a deposit slip first', 'error');
      return;
    }

    setPaymentProcessing(true);
    
    try {
      // Iterate through selected challans and pay via our new PaymentsController
      for (const fee of payingChallans) {
         let gatewayStr = 'Stripe';
         let referenceStr = 'TOK_CARD_MOCK';

         if (paymentMethod === 'mobile_wallet') {
             gatewayStr = selectedWallet === 'jazzcash' ? 'JazzCash' : 'EasyPaisa';
             referenceStr = `OTP_${otp}`;
         } else if (paymentMethod === 'bank') {
             gatewayStr = 'Bank Transfer';
             referenceStr = bankReceiptUrl;
         }

         await api.post(`/Payments/process`, {
             challanId: fee.challan_id,
             amount: fee.amount + calculateLateFee(fee.due_date),
             paymentGateway: gatewayStr,
             transactionReference: referenceStr
         });
      }
      
      Swal.fire({
        icon: 'success',
        title: paymentMethod === 'bank' ? 'Receipt Uploaded!' : 'Payment Successful!',
        text: paymentMethod === 'bank' 
          ? 'Your receipt has been sent for admin verification.' 
          : 'Your fees have been successfully paid and updated.',
        confirmButtonColor: '#10b981'
      });

      // Reset state and trigger success
      setOtpSent(false);
      setOtp('');
      setMobileNumber('');
      setBankReceiptUrl('');
      onPaymentSuccess();

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Payment failed to process';
      Swal.fire('Error', msg, 'error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-2xl">
         <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
           <ShieldCheck className="text-emerald-500 w-6 h-6" /> Secure Checkout
         </h3>
         <p className="text-sm text-gray-500 mt-1">Select a payment method to pay your pending dues.</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 space-y-6 rounded-b-2xl">
        {/* TOTAL AMOUNT WIDGET */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-center">
           <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs mb-2 sm:mb-0">Total Amount Payable</span>
           <div className="text-right">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                <span className="text-xl">Rs</span> {totalAmount.toLocaleString()}
              </span>
              <p className="text-xs text-gray-400 mt-1">For {payingChallans.length} selected challan(s)</p>
           </div>
        </div>

        {/* PAYMENT METHODS SELECTOR */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            type="button" 
            onClick={() => { setPaymentMethod('card'); setOtpSent(false); }} 
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-300 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
             <CreditCard size={24} className="mb-2" />
             <span className="text-xs font-bold text-center">Credit/Debit<br/>Card</span>
          </button>
          <button 
            type="button" 
            onClick={() => setPaymentMethod('mobile_wallet')} 
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'mobile_wallet' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-300 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
             <Smartphone size={24} className="mb-2" />
             <span className="text-xs font-bold text-center">Mobile<br/>Wallet</span>
          </button>
          <button 
            type="button" 
            onClick={() => { setPaymentMethod('bank'); setOtpSent(false); }} 
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'bank' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-300 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
             <Banknote size={24} className="mb-2" />
             <span className="text-xs font-bold text-center">Bank<br/>Transfer</span>
          </button>
        </div>

        <form onSubmit={processPayment}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 min-h-[220px]">
             
             {/* ---------------- CARD FLOW (STRIPE) ---------------- */}
             {paymentMethod === 'card' && (
               <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                     <span className="font-bold text-gray-700 dark:text-gray-300">Stripe Checkout</span>
                     <div className="flex gap-1">
                        {/* Fake logos */}
                        <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-bold italic">VISA</div>
                        <div className="w-8 h-5 bg-orange-500 rounded flex items-center justify-center text-[8px] text-white font-bold italic">MC</div>
                     </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                    <InputField placeholder="0000 0000 0000 0000" type="text" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date</label>
                      <InputField placeholder="MM/YY" type="text" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVC</label>
                      <InputField placeholder="123" type="password" required />
                    </div>
                  </div>
               </div>
             )}

             {/* ---------------- MOBILE WALLET FLOW (JAZZCASH/EASYPAISA) ---------------- */}
             {paymentMethod === 'mobile_wallet' && (
               <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="wallet" checked={selectedWallet === 'jazzcash'} onChange={() => setSelectedWallet('jazzcash')} className="text-brand-600 focus:ring-brand-500" />
                      <span className="font-bold text-gray-800 dark:text-white">JazzCash</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="wallet" checked={selectedWallet === 'easypaisa'} onChange={() => setSelectedWallet('easypaisa')} className="text-green-600 focus:ring-green-500" />
                      <span className="font-bold text-gray-800 dark:text-white">EasyPaisa</span>
                    </label>
                  </div>

                  {!otpSent ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Account Number</label>
                      <div className="flex gap-2">
                        <input 
                          placeholder="e.g. 03001234567" 
                          type="text" 
                          maxLength={11}
                          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:text-white"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        />
                        <Button type="button" onClick={handleSendOtp} className="whitespace-nowrap bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
                          Send Request
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <ShieldCheck size={14}/> Enter your registered mobile number to receive an authorization prompt.
                      </p>
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                      <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-4 mb-4">
                        <p className="text-sm font-medium text-brand-800 dark:text-brand-300">
                          Please unlock your phone and authorize the payment prompt sent to <strong>{mobileNumber}</strong>, or enter the 4-digit PIN below.
                        </p>
                      </div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">4-Digit MPIN / OTP</label>
                      <input 
                          placeholder="****" 
                          type="password" 
                          maxLength={4}
                          className="w-full text-center tracking-widest text-xl rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:text-white"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                      <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-brand-600 mt-3 font-medium hover:underline block text-center w-full">Change Mobile Number</button>
                    </div>
                  )}
               </div>
             )}

             {/* ---------------- BANK TRANSFER FLOW ---------------- */}
             {paymentMethod === 'bank' && (
               <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm mb-4 border border-blue-100 dark:border-blue-800/50">
                     Please deposit the amount to <strong>Bank Al-Habib: 1234-5678-9012</strong> (Title: Excellence Schooling) and upload the receipt below.
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Deposit Slip</label>
                    <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center cursor-pointer">
                      <input type="file" id="receipt-file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleReceiptUpload} required={!bankReceiptUrl} />
                      <div className="flex flex-col items-center pointer-events-none">
                         {uploadingReceipt ? (
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
                         ) : (
                           <Download className={`${bankReceiptUrl ? 'text-emerald-500' : 'text-gray-400'} mb-2`} size={24} />
                         )}
                         <span className={`text-sm font-bold ${bankReceiptUrl ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'}`}>
                           {bankReceiptUrl ? 'Receipt Uploaded Successfully!' : 'Click to browse or drag file here'}
                         </span>
                      </div>
                    </div>
                  </div>
               </div>
             )}

          </div>

          <div className="pt-6 flex justify-end gap-3">
             <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
             <Button 
               type="submit" 
               className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px] flex items-center justify-center gap-2" 
               disabled={paymentProcessing || (paymentMethod === 'bank' && !bankReceiptUrl) || (paymentMethod === 'mobile_wallet' && (!otpSent || otp.length < 4))}
             >
               {paymentProcessing ? 'Processing...' : (
                 <>
                   Pay Now <ChevronRight size={16} />
                 </>
               )}
             </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentCheckoutModal;
