import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Plus, Trash2, CalendarDays, Clock, Ban, Check } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DAYS = ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"];

interface AvailabilityRule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

interface AvailabilityOverride {
  id: string;
  override_date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  slot_duration_minutes: number | null;
  reason: string | null;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  package_category: string | null;
  package_name: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const AdminCalendar = () => {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [overrideForm, setOverrideForm] = useState({
    is_available: false,
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 60,
    reason: "",
  });
  const [ruleForm, setRuleForm] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 60,
  });
  const [view, setView] = useState<"rules" | "calendar">("rules");

  useEffect(() => {
    fetchRules();
    fetchOverrides();
    fetchBookings();
  }, []);

  const fetchRules = async () => {
    const { data } = await supabase.from("availability_rules").select("*").order("day_of_week");
    if (data) setRules(data as AvailabilityRule[]);
  };

  const fetchOverrides = async () => {
    const { data } = await supabase.from("availability_overrides").select("*").order("override_date");
    if (data) setOverrides(data as AvailabilityOverride[]);
  };

  const fetchBookings = async () => {
    const { data } = await supabase.from("bookings").select("*").order("booking_date", { ascending: true });
    if (data) setBookings(data as Booking[]);
  };

  const addRule = async () => {
    const { error } = await supabase.from("availability_rules").insert({
      day_of_week: ruleForm.day_of_week,
      start_time: ruleForm.start_time,
      end_time: ruleForm.end_time,
      slot_duration_minutes: ruleForm.slot_duration_minutes,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Pravidlo pridané");
    fetchRules();
  };

  const toggleRule = async (id: string, is_active: boolean) => {
    await supabase.from("availability_rules").update({ is_active: !is_active }).eq("id", id);
    fetchRules();
  };

  const deleteRule = async (id: string) => {
    await supabase.from("availability_rules").delete().eq("id", id);
    toast.success("Pravidlo zmazané");
    fetchRules();
  };

  const addOverride = async () => {
    if (!selectedDate) { toast.error("Vyberte dátum"); return; }
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { error } = await supabase.from("availability_overrides").upsert({
      override_date: dateStr,
      is_available: overrideForm.is_available,
      start_time: overrideForm.is_available ? overrideForm.start_time : null,
      end_time: overrideForm.is_available ? overrideForm.end_time : null,
      slot_duration_minutes: overrideForm.is_available ? overrideForm.slot_duration_minutes : null,
      reason: overrideForm.reason || null,
    }, { onConflict: "override_date" });
    if (error) { toast.error(error.message); return; }
    toast.success(overrideForm.is_available ? "Deň pridaný ako dostupný" : "Deň zablokovaný");
    fetchOverrides();
  };

  const deleteOverride = async (id: string) => {
    await supabase.from("availability_overrides").delete().eq("id", id);
    toast.success("Override zmazaný");
    fetchOverrides();
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    toast.success("Status aktualizovaný");
    fetchBookings();
  };

  const deleteBooking = async (id: string) => {
    await supabase.from("bookings").delete().eq("id", id);
    toast.success("Booking zmazaný");
    fetchBookings();
  };

  // Get override dates for calendar highlighting
  const blockedDates = overrides.filter(o => !o.is_available).map(o => new Date(o.override_date));
  const extraDates = overrides.filter(o => o.is_available).map(o => new Date(o.override_date));
  const bookedDates = bookings.map(b => new Date(b.booking_date));

  const selectedDateOverride = selectedDate
    ? overrides.find(o => o.override_date === format(selectedDate, "yyyy-MM-dd"))
    : null;

  const selectedDateBookings = selectedDate
    ? bookings.filter(b => b.booking_date === format(selectedDate, "yyyy-MM-dd"))
    : [];

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button size="sm" variant={view === "rules" ? "default" : "outline"} onClick={() => setView("rules")}>
          <Clock size={14} className="mr-1" /> Opakujúce pravidlá
        </Button>
        <Button size="sm" variant={view === "calendar" ? "default" : "outline"} onClick={() => setView("calendar")}>
          <CalendarDays size={14} className="mr-1" /> Kalendár & Overrides
        </Button>
      </div>

      {view === "rules" && (
        <div className="space-y-6">
          {/* Add Rule */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Pridať opakujúce pravidlo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={ruleForm.day_of_week}
                onChange={(e) => setRuleForm(p => ({ ...p, day_of_week: Number(e.target.value) }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              <Input
                type="time"
                value={ruleForm.start_time}
                onChange={(e) => setRuleForm(p => ({ ...p, start_time: e.target.value }))}
              />
              <Input
                type="time"
                value={ruleForm.end_time}
                onChange={(e) => setRuleForm(p => ({ ...p, end_time: e.target.value }))}
              />
              <select
                value={ruleForm.slot_duration_minutes}
                onChange={(e) => setRuleForm(p => ({ ...p, slot_duration_minutes: Number(e.target.value) }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </div>
            <Button size="sm" onClick={addRule}><Plus size={14} className="mr-1" /> Pridať</Button>
          </div>

          {/* Rules List */}
          <div className="space-y-2">
            {DAYS.map((dayName, dayIndex) => {
              const dayRules = rules.filter(r => r.day_of_week === dayIndex);
              return (
                <div key={dayIndex} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                  <span className="text-sm font-medium w-24">{dayName}</span>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {dayRules.length === 0 && (
                      <span className="text-xs text-muted-foreground">Nedostupné</span>
                    )}
                    {dayRules.map((rule) => (
                      <div key={rule.id} className={cn(
                        "flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border",
                        rule.is_active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground line-through"
                      )}>
                        <span>{rule.start_time.slice(0, 5)} – {rule.end_time.slice(0, 5)}</span>
                        <span className="text-muted-foreground">({rule.slot_duration_minutes}min)</span>
                        <button onClick={() => toggleRule(rule.id, rule.is_active)} className="hover:text-foreground">
                          {rule.is_active ? <Check size={12} /> : <Ban size={12} />}
                        </button>
                        <button onClick={() => deleteRule(rule.id)} className="hover:text-destructive">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className={cn("p-3 pointer-events-auto")}
              modifiers={{
                blocked: blockedDates,
                extra: extraDates,
                booked: bookedDates,
              }}
              modifiersClassNames={{
                blocked: "bg-destructive/20 text-destructive line-through",
                extra: "bg-green-500/20 text-green-400",
                booked: "ring-2 ring-primary/50",
              }}
            />
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground px-3">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/20" /> Zablokovaný</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20" /> Extra dostupný</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-primary/50" /> Má booking</span>
            </div>
          </div>

          {/* Selected Date Panel */}
          <div className="space-y-4">
            {selectedDate ? (
              <>
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <h3 className="text-sm font-semibold">
                    {format(selectedDate, "d. MMMM yyyy (EEEE)", { locale: sk })}
                  </h3>

                  {selectedDateOverride && (
                    <div className={cn(
                      "text-xs px-3 py-2 rounded-lg flex items-center justify-between",
                      selectedDateOverride.is_available ? "bg-green-500/10 text-green-400" : "bg-destructive/10 text-destructive"
                    )}>
                      <span>
                        {selectedDateOverride.is_available
                          ? `Extra dostupný: ${selectedDateOverride.start_time?.slice(0, 5)} – ${selectedDateOverride.end_time?.slice(0, 5)}`
                          : `Zablokovaný${selectedDateOverride.reason ? `: ${selectedDateOverride.reason}` : ""}`
                        }
                      </span>
                      <button onClick={() => deleteOverride(selectedDateOverride.id)} className="hover:text-foreground ml-2">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* Override Form */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium">Nastaviť override pre tento deň:</p>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          checked={!overrideForm.is_available}
                          onChange={() => setOverrideForm(p => ({ ...p, is_available: false }))}
                          className="accent-primary"
                        />
                        <Ban size={14} /> Zablokovať
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          checked={overrideForm.is_available}
                          onChange={() => setOverrideForm(p => ({ ...p, is_available: true }))}
                          className="accent-primary"
                        />
                        <Check size={14} /> Extra dostupný
                      </label>
                    </div>
                    {overrideForm.is_available && (
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="time" value={overrideForm.start_time} onChange={e => setOverrideForm(p => ({ ...p, start_time: e.target.value }))} />
                        <Input type="time" value={overrideForm.end_time} onChange={e => setOverrideForm(p => ({ ...p, end_time: e.target.value }))} />
                        <select
                          value={overrideForm.slot_duration_minutes}
                          onChange={e => setOverrideForm(p => ({ ...p, slot_duration_minutes: Number(e.target.value) }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value={30}>30 min</option>
                          <option value={60}>60 min</option>
                          <option value={90}>90 min</option>
                        </select>
                      </div>
                    )}
                    <Input
                      placeholder="Dôvod (voliteľné)"
                      value={overrideForm.reason}
                      onChange={e => setOverrideForm(p => ({ ...p, reason: e.target.value }))}
                    />
                    <Button size="sm" onClick={addOverride}>
                      {overrideForm.is_available ? "Pridať dostupnosť" : "Zablokovať deň"}
                    </Button>
                  </div>
                </div>

                {/* Bookings for selected date */}
                {selectedDateBookings.length > 0 && (
                  <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                    <h4 className="text-sm font-semibold">Bookingy na tento deň</h4>
                    {selectedDateBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between text-sm p-3 rounded-lg bg-background border border-border">
                        <div>
                          <span className="font-medium">{b.booking_time.slice(0, 5)}</span>
                          <span className="text-muted-foreground ml-2">{b.name} · {b.email}</span>
                          {b.package_name && <span className="text-xs text-primary ml-2">{b.package_name}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <select
                            value={b.status}
                            onChange={e => updateBookingStatus(b.id, e.target.value)}
                            className="text-xs bg-background border border-border rounded px-2 py-1"
                          >
                            <option value="confirmed">Potvrdený</option>
                            <option value="completed">Dokončený</option>
                            <option value="cancelled">Zrušený</option>
                          </select>
                          <button onClick={() => deleteBooking(b.id)} className="text-muted-foreground hover:text-destructive p-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-5 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">
                Vyberte dátum v kalendári pre zobrazenie detailov a nastavenie overrides.
              </div>
            )}
          </div>
        </div>
      )}

      {/* All upcoming bookings */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><CalendarDays size={16} /> Všetky bookingy</h3>
        {bookings.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Žiadne bookingy.</p>}
        {bookings.map(b => (
          <div key={b.id} className={cn(
            "flex items-start justify-between gap-4 p-3 rounded-lg border",
            b.status === 'confirmed' ? 'border-primary/30 bg-primary/5' :
            b.status === 'cancelled' ? 'border-destructive/30 bg-destructive/5 opacity-60' :
            'border-border bg-background'
          )}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{format(new Date(b.booking_date), "d.M.yyyy")}</span>
                <span className="text-sm font-bold text-primary">{b.booking_time.slice(0, 5)}</span>
                <span className="text-sm">{b.name}</span>
                <span className="text-xs text-muted-foreground">{b.email}</span>
              </div>
              {b.package_name && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                    {b.package_category === 'cameras' ? '📷' : '🌐'} {b.package_name}
                  </span>
                </div>
              )}
              {b.message && <p className="text-xs text-muted-foreground mt-1">{b.message}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <select
                value={b.status}
                onChange={e => updateBookingStatus(b.id, e.target.value)}
                className="text-xs bg-background border border-border rounded-md px-2 py-1.5"
              >
                <option value="confirmed">Potvrdený</option>
                <option value="completed">Dokončený</option>
                <option value="cancelled">Zrušený</option>
              </select>
              <button onClick={() => deleteBooking(b.id)} className="text-muted-foreground hover:text-destructive p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCalendar;
