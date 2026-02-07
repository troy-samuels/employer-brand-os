import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <Card variant="bordered" padding="lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
      <div className="space-y-4 max-w-xl">
        <Input label="Company Name" placeholder="BrandOS" />
        <Input label="Primary Domain" placeholder="brandos.com" />
        <Input label="Notification Email" placeholder="you@company.com" />
        <Button variant="primary" size="md">
          Save Settings
        </Button>
      </div>
    </Card>
  );
}
