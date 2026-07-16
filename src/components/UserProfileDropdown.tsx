import React from "react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, Award, Shield, Gift, Clipboard, CreditCard, ChevronRight, X, Sparkles, Check, Copy } from "lucide-react";

interface UserProfileDropdownProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenOrders?: () => void;
  onUpdateUser: (profile: UserProfile) => void;
}

const REWARDS = [
  {
    id: "discount-5",
    title: "خصم بقيمة 5 جنيه",
    titleEn: "5 EGP Cash Discount Voucher",
    cost: 100,
    code: "VERO5EGP",
    description: "خصم 5 جنيه على طلبك القادم من مجوهرات فيرو.",
    descriptionEn: "5 EGP off your next exquisite order at VERO Boutique.",
  },
  {
    id: "discount-10",
    title: "خصم بقيمة 10 جنيه",
    titleEn: "10 EGP Cash Discount Voucher",
    cost: 200,
    code: "VERO10EGP",
    description: "خصم 10 جنيه على طلبك القادم من مجوهرات فيرو.",
    descriptionEn: "10 EGP off your next exquisite order at VERO Boutique.",
  },
  {
    id: "discount-25",
    title: "خصم بقيمة 25 جنيه",
    titleEn: "25 EGP Cash Discount Voucher",
    cost: 500,
    code: "VERO25EGP",
    description: "خصم 25 جنيه على طلبك القادم من مجوهرات فيرو.",
    descriptionEn: "25 EGP off your next exquisite order at VERO Boutique.",
  },
  {
    id: "discount-50",
    title: "خصم بقيمة 50 جنيه",
    titleEn: "50 EGP Cash Discount Voucher",
    cost: 1000,
    code: "VERO50EGP",
    description: "خصم 50 جنيه على طلبك القادم من مجوهرات فيرو.",
    descriptionEn: "50 EGP off your next exquisite order at VERO Boutique.",
  }
];

export default function UserProfileDropdown({
  user,
  isOpen,
  onClose,
  onLogout,
  onUpdateUser,
}: UserProfileDropdownProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"overview" | "rewards">("overview");
  const [userOrders, setUserOrders] = React.useState<any[]>([]);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Daily Check-In state
  const todayStr = new Date().toDateString();
  const checkInKey = `vero_checkin_${user.email}`;
  const [hasCheckedInToday, setHasCheckedInToday] = React.useState(() => {
    return localStorage.getItem(checkInKey) === todayStr;
  });

  React.useEffect(() => {
    if (isOpen) {
      const savedOrders = localStorage.getItem("vero_orders");
      if (savedOrders) {
        try {
          const allOrders = JSON.parse(savedOrders);
          const filtered = allOrders.filter((o: any) => o.email === user.email);
          setUserOrders(filtered);
        } catch (e) {
          // ignore
        }
      } else {
        const mockOrder = {
          orderNumber: "VR-82937",
          date: "Yesterday",
          total: 1850,
          status: "In Transit from Florence",
          itemsCount: 1,
          itemName: "Lucent Chain Bracelet",
        };
        setUserOrders([mockOrder]);
      }
    }
  }, [isOpen, user.email]);

  if (!isOpen) return null;

  const handleDailyCheckIn = () => {
    if (hasCheckedInToday) return;

    const updatedUser: UserProfile = {
      ...user,
      loyaltyPoints: (user.loyaltyPoints || 0) + 250,
    };

    localStorage.setItem(checkInKey, todayStr);
    setHasCheckedInToday(true);
    onUpdateUser(updatedUser);

    setSuccessMessage("تم تسجيل الحضور اليومي وحصلت على +250 نقطة! / Daily check-in complete! +250 PTS");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRedeemReward = (reward: typeof REWARDS[0]) => {
    if ((user.loyaltyPoints || 0) < reward.cost) return;

    const currentRedeemed = user.redeemedRewards || [];
    const updatedUser: UserProfile = {
      ...user,
      loyaltyPoints: (user.loyaltyPoints || 0) - reward.cost,
      redeemedRewards: [...currentRedeemed, `${reward.titleEn} (Code: ${reward.code})`],
    };

    onUpdateUser(updatedUser);
    setSuccessMessage(`تم استرداد الجائزة بنجاح! الكود الخاص بك هو: ${reward.code}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <>
      {/* Click-outside backdrop to close */}
      <div
        id="user-dropdown-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-transparent"
      />

      {/* Dropdown Container */}
      <div
        id="user-dropdown-container"
        className="absolute right-0 mt-3 w-[350px] md:w-[420px] rounded-2xl bg-[#fff8f3] border border-[#c5a880]/30 shadow-[0_12px_40px_rgba(21,16,10,0.12)] p-5 text-brand-dark z-50 text-left"
      >
        <div className="flex justify-between items-center pb-3 border-b border-[#c5a880]/15">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
            <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#c5a880]">
              VERO Elite Vault
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-brand-outline/60 hover:text-brand-gold hover:bg-[#c5a880]/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Member Profile */}
        <div className="mt-4 flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#c5a880]/35 shadow"
          />
          <div className="space-y-0.5">
            <h4 className="font-serif text-xs md:text-sm tracking-wide font-medium uppercase text-brand-dark">
              {user.name}
            </h4>
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3 text-[#c5a880]" />
              <span className="text-[8.5px] uppercase tracking-wider font-semibold text-brand-gold">
                {user.tier}
              </span>
            </div>
            <p className="text-[9px] text-brand-outline truncate max-w-[200px]">
              {user.email}
            </p>
          </div>
        </div>

        {/* Inner Tabs Navigation */}
        <div className="flex border-b border-[#c5a880]/10 mt-4 text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`flex-1 pb-2 text-center border-b ${
              activeSubTab === "overview"
                ? "text-brand-dark border-brand-gold"
                : "text-brand-outline/60 border-transparent hover:text-brand-dark"
            }`}
          >
            الملف التعريفي / Profile
          </button>
          <button
            onClick={() => setActiveSubTab("rewards")}
            className={`flex-1 pb-2 text-center border-b ${
              activeSubTab === "rewards"
                ? "text-brand-dark border-brand-gold"
                : "text-brand-outline/60 border-transparent hover:text-brand-dark"
            }`}
          >
            متجر الجوائز / Rewards Vault
          </button>
        </div>

        {/* Global Feedback notification */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-3 bg-[#c5a880]/10 text-[#a3855a] border border-[#c5a880]/20 rounded-xl px-3 py-2 text-[10px] text-center font-semibold"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab 1: Overview */}
        {activeSubTab === "overview" && (
          <div className="space-y-4 mt-4">
            {/* Loyalty Balance */}
            <div className="p-4 rounded-xl bg-[#c5a880]/5 border border-[#c5a880]/10 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                <span className="text-brand-outline tracking-wider">رصيد النقاط / Point Balance</span>
                <span className="text-brand-gold tracking-widest text-xs">{user.loyaltyPoints || 0} PTS</span>
              </div>

              {/* Dynamic progress bar and tier text according to user specification */}
              {(() => {
                const points = user.loyaltyPoints || 0;
                let pct = 0;
                let textAr = "";
                let textEn = "";
                if (points < 5000) {
                  pct = (points / 5000) * 100;
                  textAr = `فئة برونزية. اجمع ${5000 - points} نقطة إضافية للوصول للفئة الفضية (+25% نقاط)!`;
                  textEn = `Bronze Tier. Get ${5000 - points} more PTS for Silver Tier (+25% Points rate)!`;
                } else if (points < 15000) {
                  pct = ((points - 5000) / 10000) * 100;
                  textAr = `فئة فضية (+25%). اجمع ${15000 - points} نقطة إضافية للوصول للفئة الذهبية (+50% نقاط)!`;
                  textEn = `Silver Tier (+25%). Get ${15000 - points} more PTS for Gold Tier (+50% Points rate)!`;
                } else {
                  pct = 100;
                  textAr = "فئة ذهبية (+50%). لقد وصلت للقمة! تمتع بتوصيل مجاني وخصومات حصرية!";
                  textEn = "Gold Tier (+50%). Max Level reached! Enjoy free delivery & exclusive discounts!";
                }

                return (
                  <>
                    <div className="w-full h-1.5 bg-[#c5a880]/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-gold rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1 gap-2">
                      <div className="text-[8px] text-brand-outline leading-relaxed max-w-[190px]">
                        <p className="font-semibold text-[#a3855a]">{textAr}</p>
                        <p className="mt-0.5 opacity-80">{textEn}</p>
                      </div>
                      {/* Checkin button */}
                      <button
                        onClick={handleDailyCheckIn}
                        disabled={hasCheckedInToday}
                        className={`px-2.5 py-1.5 rounded-lg text-[8.5px] uppercase font-bold tracking-wider transition-all active:scale-95 shrink-0 ${
                          hasCheckedInToday
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-[#1a1510] text-white hover:bg-black"
                        }`}
                      >
                        {hasCheckedInToday ? "✓ تم تسجيل اليوم" : "حضور يومي +250 PTS"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Member Privileges */}
            <div className="space-y-2">
              <h5 className="text-[9px] uppercase tracking-[0.2em] text-brand-outline/65 font-bold">
                ميزات العضوية الفاخرة / Perks
              </h5>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-medium">
                <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#c5a880]/10">
                  <Shield className="w-3 h-3 text-brand-gold shrink-0" />
                  <span className="text-brand-dark">مستشار خاص بفلورنسا</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#c5a880]/10">
                  <Gift className="w-3 h-3 text-brand-gold shrink-0" />
                  <span className="text-brand-dark">شحن جوي مؤمن سريع</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#c5a880]/10">
                  <CreditCard className="w-3 h-3 text-brand-gold shrink-0" />
                  <span className="text-brand-dark">أسعار حصرية للأعضاء</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#c5a880]/10">
                  <Clipboard className="w-3 h-3 text-brand-gold shrink-0" />
                  <span className="text-brand-dark">تنزيلات مباشرة سرية</span>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="pt-2 border-t border-[#c5a880]/15 space-y-2">
              <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-bold text-brand-outline/65">
                <span>الطلبات الأخيرة / Recent Orders</span>
                <span className="font-sans text-[8px] text-brand-gold font-semibold uppercase">{userOrders.length} Completed</span>
              </div>

              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {userOrders.length === 0 ? (
                  <p className="text-[9px] text-brand-outline/60 italic text-center py-2">
                    لا توجد طلبات مسجلة بعد.
                  </p>
                ) : (
                  userOrders.map((order, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-[#c5a880]/10 rounded-lg p-2 text-[9.5px]">
                      <div>
                        <p className="font-semibold text-brand-dark uppercase tracking-wider">{order.itemName || "Boutique Order"}</p>
                        <p className="text-[8px] text-brand-outline/60 mt-0.5">{order.orderNumber} • {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand-gold">${order.total}</p>
                        <p className="text-[7.5px] uppercase font-bold text-emerald-600 tracking-wider mt-0.5">{order.status || "Completed"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rewards Vault */}
        {activeSubTab === "rewards" && (
          <div className="space-y-4 mt-4">
            {/* Header info */}
            <div className="bg-[#c5a880]/5 border border-[#c5a880]/10 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[9px] text-brand-outline font-semibold uppercase">نقاطك المتاحة / Available Points</p>
                <p className="text-sm font-bold text-brand-gold">{user.loyaltyPoints || 0} PTS</p>
              </div>
              <p className="text-[8px] text-brand-outline/70 text-right max-w-[150px]">
                استبدل نقاطك بكوبونات خصم أو ميزات جوية فورية.
              </p>
            </div>

            {/* Rewards Catalogue */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {REWARDS.map((reward) => {
                const canAfford = (user.loyaltyPoints || 0) >= reward.cost;
                return (
                  <div
                    key={reward.id}
                    className="p-3 bg-white border border-[#c5a880]/15 rounded-xl space-y-1.5 text-left relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h6 className="font-serif text-[10.5px] font-bold text-brand-dark">
                          {reward.title}
                        </h6>
                        <span className="text-[8px] font-sans text-brand-outline/70 block">
                          {reward.titleEn}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-brand-gold bg-[#c5a880]/10 px-1.5 py-0.5 rounded-md shrink-0">
                        {reward.cost} PTS
                      </span>
                    </div>

                    <p className="text-[8.5px] text-brand-outline leading-relaxed">
                      {reward.description}
                    </p>

                    <div className="flex justify-between items-center pt-1 border-t border-[#c5a880]/5">
                      <span className="text-[8px] text-brand-outline/65">
                        Code: {reward.code}
                      </span>
                      <button
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!canAfford}
                        className={`px-3 py-1 rounded-lg text-[8px] uppercase font-bold tracking-wider transition-all ${
                          canAfford
                            ? "bg-brand-gold hover:bg-[#b0936e] text-white active:scale-95"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {canAfford ? "استرداد الجائزة" : "نقاط غير كافية"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* My Redeemed Rewards Vouchers */}
            {user.redeemedRewards && user.redeemedRewards.length > 0 && (
              <div className="pt-2 border-t border-[#c5a880]/15 space-y-2">
                <h5 className="text-[9px] uppercase tracking-[0.2em] text-brand-outline/65 font-bold">
                  جوائزي المستردة / My Redeemed Awards
                </h5>
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {user.redeemedRewards.map((item, idx) => {
                    const codeMatch = item.match(/Code:\s*([A-Z0-9]+)/);
                    const code = codeMatch ? codeMatch[1] : "";
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-[#fdfaf7] border border-[#c5a880]/10 rounded-lg p-2 text-[9px]"
                      >
                        <span className="truncate max-w-[200px] text-brand-dark font-medium">{item.split(" (Code:")[0]}</span>
                        {code && (
                          <button
                            onClick={() => handleCopyCode(code)}
                            className="flex items-center gap-1 text-[8.5px] font-mono text-brand-gold hover:text-[#b0936e] bg-white border border-[#c5a880]/20 px-1.5 py-0.5 rounded-md active:scale-95 transition-all"
                          >
                            {copiedCode === code ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>{code}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-[#c5a880]/15">
          <button
            id="btn-logout"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
            Exit Private Vault
          </button>
        </div>
      </div>
    </>
  );
}
