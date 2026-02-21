import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SettingsPage = () => {
  const { config, updateConfig } = useBookings();
  const { toast } = useToast();
  const [workingDays, setWorkingDays] = useState<number[]>(config.workingDays);
  const [startTime, setStartTime] = useState(config.startTime);
  const [endTime, setEndTime] = useState(config.endTime);

  const toggleDay = (day: number) => {
    setWorkingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort());
  };

  const handleSave = () => {
    updateConfig({ workingDays, startTime, endTime, slotDuration: 15 });
    toast({ title: 'Settings saved', description: 'Time slot configuration updated.' });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Time Slot Configuration</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Working Days</Label>
          {dayNames.map((name, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
              <span className="text-sm">{name}</span>
              <Switch checked={workingDays.includes(i)} onCheckedChange={() => toggleDay(i)} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
          <div className="space-y-2"><Label>End Time</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
          Fixed slot duration: <strong>15 minutes</strong>. This is for display only — no availability validation.
        </div>
        <Button onClick={handleSave}>Save Configuration</Button>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
