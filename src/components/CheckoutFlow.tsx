import React from "react";
import { X, Lock, Check, Gift, ShoppingBag, CreditCard, Sparkles, Mail, User, MapPin } from "lucide-react";
import { CartItem, UserProfile, getTierFromSpent } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  promoCode: string;
  onClearCart: () => void;
  onCheckoutSuccess?: (items: CartItem[]) => void;
  user?: UserProfile | null;
  onUpdateUser?: (profile: UserProfile) => void;
}

export default function CheckoutFlow({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  tax,
  discount,
  total,
  promoCode,
  onClearCart,
  onCheckoutSuccess,
  user,
  onUpdateUser,
}: CheckoutFlowProps) {
  const [step, setStep] = React.useState<"shipping" | "payment" | "success">("shipping");
  const [loading, setLoading] = React.useState(false);

  // Form states
  const [shippingName, setShippingName] = React.useState("");
  const [shippingEmail, setShippingEmail] = React.useState("");
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [shippingCity, setShippingCity] = React.useState("");
  const [shippingZip, setShippingZip] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCVV, setCardCVV] = React.useState("");
  const [generatedOrderNumber, setGeneratedOrderNumber] = React.useState("");
  const [earnedPoints, setEarnedPoints] = React.useState(0);
  const [earnedBonusPoints, setEarnedBonusPoints] = React.useState(0);
  const [tierBoostPercent, setTierBoostPercent] = React.useState(0);
  const [usePoints, setUsePoints] = React.useState(false);
  const [usedPointsAmount, setUsedPointsAmount] = React.useState(0);
  const [pointsDiscountAmount, setPointsDiscountAmount] = React.useState(0);

  const pointsCalculation = React.useMemo(() => {
    if (!user) {
      return {
        eligible: false,
        currentPoints: 0,
        maxPointsAllowed: 0,
        maxDiscount: 0,
        pointsToRedeem: 0,
        cashDiscount: 0,
        reason: ""
      };
    }
    
    const currentPoints = user.loyaltyPoints || 0;
    if (currentPoints < 1000) {
      return {
        eligible: false,
        currentPoints,
        maxPointsAllowed: 0,
        maxDiscount: 0,
        pointsToRedeem: 0,
        cashDiscount: 0,
        reason: "لا يمكن استخدام النقاط إلا بعد وصول الرصيد إلى 1000 نقطة. / Loyalty points cannot be used until your balance reaches 1,000 PTS."
      };
    }

    // Max cash discount is 20% of the order total
    const maxCashDiscount = total * 0.20;
    // Each 100 points = 5 units discount. So points needed = (discount / 5) * 100
    const rawPointsNeededForMaxDiscount = (maxCashDiscount / 5) * 100;
    const maxPointsAllowed = Math.floor(rawPointsNeededForMaxDiscount / 100) * 100;

    // How many points the user actually has available to spend (in multiples of 100)
    const pointsAvailable = Math.floor(currentPoints / 100) * 100;

    // Points to actually redeem
    const pointsToRedeem = Math.min(pointsAvailable, maxPointsAllowed);
    const cashDiscount = (pointsToRedeem / 100) * 5;

    return {
      eligible: true,
      currentPoints,
      maxPointsAllowed,
      maxDiscount: maxCashDiscount,
      pointsToRedeem,
      cashDiscount,
      reason: ""
    };
  }, [user, total]);

  // Pre-fill user details if logged in
  React.useEffect(() => {
    if (isOpen && user) {
      setShippingName(user.name);
      setShippingEmail(user.email);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderNum = "VR-9830" + Math.floor(Math.random() * 900 + 100);
    setGeneratedOrderNumber(orderNum);

    // Save used points and discount values for UI
    const redeemed = usePoints ? pointsCalculation.pointsToRedeem : 0;
    const discountVal = usePoints ? pointsCalculation.cashDiscount : 0;
    setUsedPointsAmount(redeemed);
    setPointsDiscountAmount(discountVal);

    const finalPayable = Math.max(0, total - discountVal);

    // Calculate multiplier based on tier according to user request
    let multiplier = 1.0;
    let boostPct = 0;
    if (user) {
      const tier = user.tier || "Bronze";
      if (tier === "Diamond") {
        multiplier = 2.5;
        boostPct = 150;
      } else if (tier === "Platinum") {
        multiplier = 2.0;
        boostPct = 100;
      } else if (tier === "Gold") {
        multiplier = 1.5;
        boostPct = 50;
      } else if (tier === "Silver") {
        multiplier = 1.25;
        boostPct = 25;
      }
    }
    setTierBoostPercent(boostPct);

    // Points from spending (1 Point per 100 EGP * multiplier)
    const basePts = Math.round((finalPayable / 100) * multiplier);

    // First order bonus: +100 gift points
    let isFirst = true;
    try {
      const savedOrders = localStorage.getItem("vero_orders");
      if (savedOrders && user) {
        const allOrders = JSON.parse(savedOrders);
        const userOrders = allOrders.filter((o: any) => o.email.toLowerCase() === user.email.toLowerCase());
        if (userOrders.length > 0) {
          isFirst = false;
        }
      }
    } catch (err) {
      // ignore
    }

    const bonusPts = isFirst ? 100 : 0;
    setEarnedBonusPoints(bonusPts);

    const finalEarnedPts = basePts + bonusPts;
    setEarnedPoints(finalEarnedPts);

    // Save order details to localStorage
    const newOrder = {
      orderNumber: orderNum,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: finalPayable,
      status: "In Transit from Florence",
      itemsCount: cartItems.length,
      itemName: cartItems[0]?.product.name || "Boutique Order",
      email: shippingEmail.toLowerCase()
    };

    try {
      const savedOrders = localStorage.getItem("vero_orders");
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      localStorage.setItem("vero_orders", JSON.stringify([newOrder, ...currentOrders]));
    } catch (err) {
      // ignore
    }

    // Award loyalty points and total spend to user and deduct redeemed points
    if (user && onUpdateUser) {
      const currentSpent = Number(user.totalSpent || 0);
      const updatedSpent = currentSpent + finalPayable;
      const updatedTier = getTierFromSpent(updatedSpent);

      const updatedUser: UserProfile = {
        ...user,
        loyaltyPoints: Math.max(0, (user.loyaltyPoints || 0) - redeemed + finalEarnedPts),
        totalSpent: updatedSpent,
        tier: updatedTier,
      };
      onUpdateUser(updatedUser);
    }

    setTimeout(() => {
      setLoading(false);
      setStep("success");
      if (onCheckoutSuccess) {
        onCheckoutSuccess(cartItems);
      }
    }, 2000);
  };

  const handleCompleteClose = () => {
    onClearCart();
    setStep("shipping");
    setShippingName("");
    setShippingEmail("");
    setShippingAddress("");
    setShippingCity("");
    setShippingZip("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVV("");
    setUsePoints(false);
    setUsedPointsAmount(0);
    setPointsDiscountAmount(0);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-end">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step !== "success" ? onClose : undefined}
          className="absolute inset-0 bg-brand-umber/45 backdrop-blur-sm"
        />

        {/* Panel body */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative w-full max-w-lg h-full bg-brand-linen shadow-2xl border-l border-brand-outline-variant/30 flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-brand-outline-variant/30 flex justify-between items-center bg-[#fff8f3]">
            <div>
              <h2 className="font-serif text-xl text-brand-umber font-semibold uppercase tracking-wider">
                {step === "success" ? "Order Complete" : "Secure Checkout"}
              </h2>
              <p className="text-[10px] font-sans text-brand-outline tracking-wider uppercase mt-1">
                {step === "shipping" && "Step 1 of 2: Shipping Details"}
                {step === "payment" && "Step 2 of 2: Payment Details"}
                {step === "success" && "Thank you for your order"}
              </p>
            </div>
            {step !== "success" && (
              <button
                onClick={onClose}
                className="p-2 text-brand-outline hover:text-brand-gold transition-colors"
                aria-label="Close Checkout"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Checkout body scroll */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8">
            {step === "shipping" && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-serif text-base text-brand-umber flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-gold" />
                    1. Customer Information
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-outline uppercase tracking-wider block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="E.g. Elena Rosales"
                      className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 text-xs font-light"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-outline uppercase tracking-wider block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      placeholder="E.g. elena@luxury.com"
                      className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 text-xs font-light"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-brand-outline-variant/10">
                  <h3 className="font-serif text-base text-brand-umber flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    2. Shipping Address
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-outline uppercase tracking-wider block">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="E.g. 15 Via della Spiga"
                      className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 text-xs font-light"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-brand-outline uppercase tracking-wider block">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        placeholder="E.g. Milan"
                        className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 text-xs font-light"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-brand-outline uppercase tracking-wider block">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingZip}
                        onChange={(e) => setShippingZip(e.target.value)}
                        placeholder="E.g. 20121"
                        className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 text-xs font-light"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Option */}
                <div className="bg-brand-surface-container/60 p-4 rounded-sm space-y-2 border border-brand-outline-variant/10">
                  <span className="text-[10px] font-semibold text-brand-umber uppercase tracking-widest block">
                    Bespoke Courier Service
                  </span>
                  <p className="text-[11px] text-brand-outline font-light leading-relaxed">
                    Complimentary Premium Shipping. Delivered inside an iconic, sand-scented VERO linen gift box, completed with a hand-waxed envelope certificate.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-brand-umber text-white font-sans text-xs font-semibold uppercase tracking-[0.15em] py-5 transition-all duration-300 shadow-lg"
                >
                  Continue to Payment
                </button>
              </form>
            )}

            {step === "payment" && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-serif text-base text-brand-umber flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-gold" />
                    3. Payment Information
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-outline uppercase tracking-wider block">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 pl-8 text-xs font-light"
                      />
                      <CreditCard className="absolute left-1.5 top-2.5 w-4 h-4 text-brand-outline/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-brand-outline uppercase tracking-wider block">
                        Expiration Date
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 text-xs font-light"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-brand-outline uppercase tracking-wider block">
                        Secure CVV
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                        placeholder="***"
                        className="w-full bg-transparent border-b border-brand-outline-variant focus:border-brand-gold outline-none py-2 text-xs font-light"
                      />
                    </div>
                  </div>
                </div>

                {/* VERO Loyalty Points Option */}
                {user && (
                  <div className="bg-[#c5a880]/5 border border-[#c5a880]/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-gold" />
                        <span className="font-serif font-medium text-xs text-brand-umber">
                          نقاط مكافآت فيرو / VERO Loyalty Rewards
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-full font-mono">
                        {user.loyaltyPoints || 0} PTS
                      </span>
                    </div>

                    {!pointsCalculation.eligible ? (
                      <p className="text-[10px] text-brand-outline leading-relaxed font-light">
                        {pointsCalculation.reason}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <input
                            id="use-loyalty-points"
                            type="checkbox"
                            checked={usePoints}
                            onChange={(e) => setUsePoints(e.target.checked)}
                            className="mt-0.5 rounded border-[#c5a880]/30 text-brand-gold focus:ring-brand-gold accent-brand-gold cursor-pointer"
                          />
                          <label htmlFor="use-loyalty-points" className="cursor-pointer select-none">
                            <span className="block text-xs font-semibold text-brand-umber">
                              دفع جزء من الطلب بالنقاط / Pay Part of Order with Points
                            </span>
                            <span className="block text-[10px] text-brand-outline font-light mt-1 leading-relaxed">
                              استخدم <span className="font-bold text-brand-gold font-mono">{pointsCalculation.pointsToRedeem} نقطة</span> للحصول على خصم <span className="font-bold text-brand-umber font-mono">${pointsCalculation.cashDiscount}</span> (حد أقصى 20% من قيمة الطلب).
                            </span>
                          </label>
                        </div>

                        {usePoints && (
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 text-[10px] text-emerald-800 font-medium flex justify-between">
                            <span>تم تطبيق خصم النقاط / Points Discount Applied</span>
                            <span className="font-semibold font-mono">-${pointsCalculation.cashDiscount}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Total Summary recap */}
                <div className="bg-brand-surface-container/60 p-5 rounded-sm border border-brand-outline-variant/20 space-y-3">
                  <h4 className="text-[10px] font-semibold text-brand-umber uppercase tracking-widest mb-2 pb-2 border-b border-brand-outline-variant/10">
                    Order Summary Recalculated
                  </h4>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-brand-outline font-light">
                      <span>
                        {item.product.name} (x{item.quantity})
                      </span>
                      <span>${(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-brand-gold">
                      <span>Promo Applied ({promoCode})</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}
                  {usePoints && pointsCalculation.cashDiscount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-700 font-medium">
                      <span>خصم نقاط الولاء / Loyalty Discount (-{pointsCalculation.pointsToRedeem} PTS)</span>
                      <span>-${pointsCalculation.cashDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-brand-outline font-light">
                    <span>Tax (8%)</span>
                    <span>${tax.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-brand-outline-variant/10 w-full pt-1" />
                  <div className="flex justify-between items-end font-serif font-semibold text-brand-umber text-base pt-1">
                    <span>{usePoints ? "Final Payable / المبلغ المطلوب" : "Total Bill"}</span>
                    <span>${(usePoints ? Math.max(0, total - pointsCalculation.cashDiscount) : total).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-gold hover:bg-brand-umber disabled:bg-brand-gold/70 text-white font-sans text-xs font-semibold uppercase tracking-[0.15em] py-5 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Processing Bespoke Order..."
                  ) : (
                    <>
                      <Lock className="w-4 h-4 stroke-[1.5]" />
                      Pay Securely ${(usePoints ? Math.max(0, total - pointsCalculation.cashDiscount) : total).toLocaleString()}
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold flex items-center justify-center rounded-full mx-auto shadow-sm">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-brand-gold tracking-[0.15em] uppercase block">
                    Bespoke Order Confirmed
                  </span>
                  <h3 className="font-serif text-2xl text-brand-umber font-semibold tracking-wide">
                    Details Define You, {shippingName}
                  </h3>
                  {user && earnedPoints > 0 && (
                    <div className="bg-[#c5a880]/5 border border-[#c5a880]/20 rounded-xl p-3.5 max-w-sm mx-auto space-y-2 text-left">
                      <div className="flex items-center gap-1.5 justify-center font-bold text-[#a3855a] text-[10px] uppercase tracking-wider pb-1.5 border-b border-[#c5a880]/15">
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                        <span>لقد ربحت +{earnedPoints} نقطة ولاء! / Earned +{earnedPoints} PTS!</span>
                      </div>
                      <div className="text-[9px] text-brand-outline space-y-1">
                        {usedPointsAmount > 0 && (
                          <div className="flex justify-between text-red-700 font-semibold border-b border-[#c5a880]/15 pb-1.5 mb-1.5">
                            <span>النقاط المستردة / Points Redeemed:</span>
                            <span>-{usedPointsAmount} PTS</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>النقاط الأساسية (كل 10 جنيه = نقطة):</span>
                          <span className="font-semibold text-brand-dark">{Math.round((total - pointsDiscountAmount) / 10)} PTS</span>
                        </div>
                        {tierBoostPercent > 0 && (
                          <div className="flex justify-between text-amber-700">
                            <span>بونص الفئة (+{tierBoostPercent}%):</span>
                            <span className="font-semibold">+{Math.round(((total - pointsDiscountAmount) / 10) * (tierBoostPercent / 100))} PTS</span>
                          </div>
                        )}
                        {earnedBonusPoints > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>هدية أول طلب (+100 نقطة):</span>
                            <span className="font-semibold">+100 PTS</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-[#c5a880]/15 pt-1.5 text-brand-gold font-bold text-[9.5px]">
                          <span>إجمالي النقاط المكتسبة / Net Earned:</span>
                          <span>+{earnedPoints} PTS</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-brand-outline font-light max-w-sm mx-auto leading-relaxed">
                    Your luxury order has been registered securely. Our Florence workshop is starting the manual forging and packaging process for your custom package.
                  </p>
                </div>

                {/* Receipt slip */}
                <div className="bg-white p-5 rounded-sm shadow-sm border border-brand-outline-variant/20 text-left space-y-4 max-w-sm mx-auto font-sans">
                  <div className="flex justify-between border-b border-brand-outline-variant/10 pb-3 text-xs">
                    <span className="font-semibold text-brand-umber uppercase">Order Number:</span>
                    <span className="font-mono text-brand-gold font-medium">{generatedOrderNumber}</span>
                  </div>

                  <div className="space-y-2 text-xs font-light text-brand-outline">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.product.name} (x{item.quantity})
                        </span>
                        <span>${(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {discount > 0 && (
                      <div className="flex justify-between text-brand-gold text-xs">
                        <span>Promo Discount:</span>
                        <span>-${discount.toLocaleString()}</span>
                      </div>
                    )}
                    {pointsDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 text-xs">
                        <span>Loyalty Points Discount:</span>
                        <span>-${pointsDiscountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="h-px bg-brand-outline-variant/10 my-2" />
                    <div className="flex justify-between font-semibold text-brand-umber">
                      <span>Total Amount Paid:</span>
                      <span className="text-brand-gold font-bold">${(total - pointsDiscountAmount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-brand-surface-container/40 p-3 rounded-sm border border-brand-outline-variant/10 space-y-1">
                    <span className="text-[9px] font-bold text-brand-umber uppercase block tracking-wider">
                      Delivery Address:
                    </span>
                    <p className="text-[10px] text-brand-outline font-light leading-snug">
                      {shippingName}
                      <br />
                      {shippingAddress}, {shippingCity}, {shippingZip}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCompleteClose}
                  className="w-full bg-brand-gold hover:bg-brand-umber text-white font-sans text-xs font-semibold uppercase tracking-[0.15em] py-5 transition-all duration-300 shadow-lg"
                >
                  Return to Boutique
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
