import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle, CalendarDays, Clock, ChevronLeft } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { sk } from "date-fns/locale";
import { cn } from "@/lib/utils";

const reservationSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné").max(100),
  email: z.string().trim().email("Neplatný email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
  packageCategory: "cameras" | "web";
  packageName: string;
}

interface AvailabilityRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

interface AvailabilityOverride {
  override_date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  slot_duration_minutes: number | null;
}

interface Booking {
  booking_date: string;
  booking_time: string;
  status: string;
}

function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    current += durationMinutes;
  }
  return slots;
}

const ReservationModal = ({ open, onClose, packageCategory, packageName }: ReservationModalProps) => {
  const [step, setStep] = useState<"date" | "form">("date");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    if (open) {
      setLoadingSlots(true);
      Promise.all([
        supabase.from("availability_rules").select("*").eq("is_active", true),
        supabase.from("availability_overrides").select("*"),
        supabase.from("bookings").select("booking_date,booking_time,status").neq("status", "cancelled"),
      ]).then(([rulesRes, overridesRes, bookingsRes]) => {
        if (rulesRes.data) setRules(rulesRes.data as AvailabilityRule[]);
        if (overridesRes.data) setOverrides(overridesRes.data as AvailabilityOverride[]);
        if (bookingsRes.data) setExistingBookings(bookingsRes.data as Booking[]);
        setLoadingSlots(false);
      });
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSent(false);
      setStep("date");
      setSelectedDate(undefined);
      setSelectedTime(null);
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    }, 300);
  };

  // Check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    const override = overrides.find(o => o.override_date === dateStr);
    if (override) return override.is_available;
    const dayOfWeek = date.getDay();
    return rules.some(r => r.day_of_week === dayOfWeek && r.is_active);
  };

  // Get time slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const override = overrides.find(o => o.override_date === dateStr);

    let slots: string[] = [];
    if (override && override.is_available && override.start_time && override.end_time) {
      slots = generateTimeSlots(override.start_time, override.end_time, override.slot_duration_minutes || 60);
    } else if (!override) {
      const dayOfWeek = selectedDate.getDay();
      const dayRules = rules.filter(r => r.day_of_week === dayOfWeek && r.is_active);
      dayRules.forEach(rule => {
        slots.push(...generateTimeSlots(rule.start_time, rule.end_time, rule.slot_duration_minutes));
      });
    }

    // Remove already booked slots
    const dayBookings = existingBookings.filter(b => b.booking_date === dateStr);
    return slots.filter(slot => !dayBookings.some(b => b.booking_time.slice(0, 5) === slot));
  }, [selectedDate, rules, overrides, existingBookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = reservationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Vyberte dátum a čas");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("bookings").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      message: result.data.message || null,
      booking_date: format(selectedDate, "yyyy-MM-dd"),
      booking_time: selectedTime,
      package_category: packageCategory,
      package_name: packageName,
    });

    setSending(false);
    if (error) {
      toast.error("Nepodarilo sa vytvoriť rezerváciu.");
      return;
    }

    setSent(true);
    toast.success("Stretnutie bolo zarezervované!");
  };

  const today = startOfDay(new Date());

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="mx-auto text-primary mb-4" size={48} strokeWidth={1.5} />
                <h3 className="text-xl font-bold mb-2">Zarezervované!</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="text-foreground font-medium">{packageName}</span>
                </p>
                <p className="text-sm text-primary font-semibold mb-1">
                  {selectedDate && format(selectedDate, "d. MMMM yyyy", { locale: sk })}
                </p>
                <p className="text-lg font-bold text-foreground mb-6">{selectedTime}</p>
                <p className="text-xs text-muted-foreground mb-4">Potvrdenie príde na váš email.</p>
                <button onClick={handleClose} className="text-sm text-primary underline underline-offset-4">
                  Zavrieť
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">Rezervácia</span>
                  <h3 className="text-xl font-bold mt-1">{packageName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {packageCategory === "cameras" ? "Kamerový systém" : "Webový balíček"}
                  </p>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <div className={cn("flex items-center gap-1.5 text-xs font-medium", step === "date" ? "text-primary" : "text-muted-foreground")}>
                    <CalendarDays size={14} /> 1. Termín
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className={cn("flex items-center gap-1.5 text-xs font-medium", step === "form" ? "text-primary" : "text-muted-foreground")}>
                    <Send size={14} /> 2. Údaje
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {step === "date" ? (
                    <motion.div
                      key="date"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="animate-spin text-primary" size={24} />
                        </div>
                      ) : rules.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          Momentálne nie sú nastavené žiadne voľné termíny.
                        </div>
                      ) : (
                        <>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                            disabled={(date) => isBefore(date, today) || !isDateAvailable(date)}
                            className={cn("p-3 pointer-events-auto")}
                          />

                          {selectedDate && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Voľné termíny na {format(selectedDate, "d. MMMM", { locale: sk })}:
                              </p>
                              {availableSlots.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Žiadne voľné sloty na tento deň.</p>
                              ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {availableSlots.map((slot) => (
                                    <button
                                      key={slot}
                                      onClick={() => setSelectedTime(slot)}
                                      className={cn(
                                        "text-sm py-2 px-3 rounded-lg border transition-all",
                                        selectedTime === slot
                                          ? "bg-primary text-primary-foreground border-primary"
                                          : "border-border hover:border-primary/50 text-foreground"
                                      )}
                                    >
                                      <Clock size={12} className="inline mr-1" />
                                      {slot}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => setStep("form")}
                            disabled={!selectedDate || !selectedTime}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                          >
                            Pokračovať →
                          </button>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-3"
                    >
                      {/* Selected slot summary */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                        <CalendarDays size={18} className="text-primary" />
                        <div className="text-sm">
                          <span className="font-medium">{selectedDate && format(selectedDate, "d. MMMM yyyy", { locale: sk })}</span>
                          <span className="text-primary font-bold ml-2">{selectedTime}</span>
                        </div>
                        <button
                          onClick={() => setStep("date")}
                          className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <ChevronLeft size={12} /> Zmeniť
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Meno a priezvisko *"
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                          />
                          {errors.name && <p className="text-xs text-destructive mt-1 px-1">{errors.name}</p>}
                        </div>
                        <div>
                          <input
                            type="email"
                            placeholder="Email *"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                          />
                          {errors.email && <p className="text-xs text-destructive mt-1 px-1">{errors.email}</p>}
                        </div>
                        <input
                          type="tel"
                          placeholder="Telefón (voliteľné)"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <textarea
                          placeholder="Poznámka (voliteľné)"
                          rows={3}
                          value={form.message}
                          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        />
                        <button
                          type="submit"
                          disabled={sending}
                          className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {sending ? (
                            <><Loader2 size={16} className="animate-spin" /> Rezervujem...</>
                          ) : (
                            <><Send size={16} /> Zarezervovať stretnutie</>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReservationModal;
