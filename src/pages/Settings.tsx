import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();

  return (
    <AppLayout title="Settings" description="Global application settings">
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle>Default Survey Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Default First Reminder (days)</Label>
                <Input type="number" defaultValue={7} />
              </div>
              <div className="space-y-2">
                <Label>Default Second Reminder (days)</Label>
                <Input type="number" defaultValue={3} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Default CC Email</Label>
              <Input placeholder="survey-admin@abbott.com" />
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Notification Email</Label>
              <Input placeholder="admin@abbott.com" />
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => toast({ title: 'Settings saved' })}>Save Changes</Button>
      </div>
    </AppLayout>
  );
}
