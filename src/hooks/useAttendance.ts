import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  type: "work" | "sick" | "vacation" | "constraint";
  note: string | null;
}

const todayISO = () => new Date().toLocaleDateString("en-CA");

interface ActiveBreak { id: string; started_at: string }

export function useAttendance() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeBreak, setActiveBreak] = useState<ActiveBreak | null>(null);
  const [todayDate, setTodayDate] = useState<string>(() => todayISO());
  const currentDateRef = useRef(todayDate);

  const loadTodayRecord = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayDate)
      .maybeSingle();
    if (error) console.error("attendance load error:", error);
    setTodayRecord((data as AttendanceRecord | null) ?? null);
    setIsLoading(false);
  }, [user, todayDate]);

  useEffect(() => { void loadTodayRecord(); }, [loadTodayRecord]);

  const loadActiveBreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("break_sessions")
      .select("id, started_at")
      .eq("user_id", user.id)
      .eq("date", todayDate)
      .is("ended_at", null)
      .maybeSingle();
    setActiveBreak((data as ActiveBreak | null) ?? null);
  }, [user, todayDate]);

  useEffect(() => { void loadActiveBreak(); }, [loadActiveBreak]);

  // Detect midnight rollover — reset state and reload
  useEffect(() => {
    const t = setInterval(() => {
      const newDate = todayISO();
      if (newDate !== currentDateRef.current) {
        currentDateRef.current = newDate;
        setTodayDate(newDate);
        setTodayRecord(null);
        setActiveBreak(null);
        setElapsedSeconds(0);
        toast("🌅 יום עבודה חדש החל!");
      }
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  // Live timer
  useEffect(() => {
    if (!todayRecord?.check_in || todayRecord.check_out) {
      if (todayRecord?.check_in && todayRecord.check_out) {
        const diff = (new Date(todayRecord.check_out).getTime() - new Date(todayRecord.check_in).getTime()) / 1000;
        setElapsedSeconds(Math.max(0, Math.floor(diff)));
      }
      return;
    }
    const start = new Date(todayRecord.check_in).getTime();
    setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    const t = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [todayRecord]);

  const checkIn = useCallback(async () => {
    if (!user) { toast.error("יש להתחבר תחילה"); return; }
    if (todayRecord?.check_in) { toast.error("כבר נכנסת לעבודה היום"); return; }

    setIsSaving(true);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("attendance")
      .insert({ user_id: user.id, date: todayDate, check_in: now, type: "work" })
      .select()
      .single();

    if (error) {
      toast.error("שגיאה בשמירת כניסה, נסה שנית");
      console.error(error);
    } else {
      setTodayRecord(data as AttendanceRecord);
      toast.success("כניסה נרשמה בהצלחה ✅");
      // Auto +5 points
      const { error: pErr } = await supabase.from("points").insert({
        user_id: user.id,
        amount: 5,
        reason: "כניסה לעבודה",
      });
      if (pErr) console.error("points insert error:", pErr);
      else qc.invalidateQueries({ queryKey: ["my-points-month"] });
    }
    setIsSaving(false);
  }, [user, todayRecord, todayDate, qc]);

  const checkOut = useCallback(async () => {
    if (!user || !todayRecord?.id) return;
    if (!todayRecord.check_in) { toast.error("לא נרשמה כניסה לעבודה היום"); return; }
    if (todayRecord.check_out) { toast.error("כבר יצאת מהעבודה היום"); return; }

    setIsSaving(true);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("attendance")
      .update({ check_out: now })
      .eq("id", todayRecord.id)
      .select()
      .single();

    if (error) {
      toast.error("שגיאה בשמירת יציאה, נסה שנית");
      console.error(error);
    } else {
      setTodayRecord(data as AttendanceRecord);
      const totalMin = Math.floor(elapsedSeconds / 60);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      toast.success(`יציאה נרשמה ✅ | עבדת ${h} שעות ו-${m} דקות`);
    }
    setIsSaving(false);
  }, [user, todayRecord, elapsedSeconds]);

  const startBreak = useCallback(async () => {
    if (!user) return;
    if (!todayRecord?.check_in || todayRecord.check_out) {
      toast.error("יש להיכנס לעבודה תחילה");
      return;
    }
    if (activeBreak) { toast.error("כבר בהפסקה"); return; }
    const { data, error } = await supabase
      .from("break_sessions")
      .insert({ user_id: user.id, date: todayDate, started_at: new Date().toISOString() })
      .select("id, started_at")
      .single();
    if (error) { toast.error("שגיאה בתחילת הפסקה"); console.error(error); return; }
    setActiveBreak(data as ActiveBreak);
    toast("☕ הפסקה החלה – השעון ממשיך לרוץ");
  }, [user, todayRecord, activeBreak, todayDate]);

  const endBreak = useCallback(async () => {
    if (!user || !activeBreak) return;
    const endedAt = new Date();
    const startedAt = new Date(activeBreak.started_at);
    const durationMinutes = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));
    const { error } = await supabase
      .from("break_sessions")
      .update({ ended_at: endedAt.toISOString(), duration_minutes: durationMinutes })
      .eq("id", activeBreak.id);
    if (error) { toast.error("שגיאה בסיום ההפסקה"); console.error(error); return; }
    setActiveBreak(null);
    toast.success(`חזרת לעבודה ✅ | הפסקה: ${durationMinutes} דקות`);
  }, [user, activeBreak]);

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${h}:${mm}:${ss}`;
  };

  // Only treat as checked-in/out if the record actually belongs to today
  const isToday = todayRecord?.date === todayDate;
  const isCheckedIn = isToday && !!todayRecord?.check_in;
  const isCheckedOut = isToday && !!todayRecord?.check_out;
  const isClockedIn = isCheckedIn && !isCheckedOut;

  const checkInTime = todayRecord?.check_in
    ? new Date(todayRecord.check_in).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    : null;

  return {
    todayRecord,
    isLoading,
    isSaving,
    isCheckedIn,
    isCheckedOut,
    isClockedIn,
    elapsedSeconds,
    checkInTime,
    timerDisplay: formatTimer(elapsedSeconds),
    checkIn,
    checkOut,
    isOnBreak: !!activeBreak,
    startBreak,
    endBreak,
  };
}