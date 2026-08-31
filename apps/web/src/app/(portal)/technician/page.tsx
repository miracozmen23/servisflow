import { Construction } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TechnicianPage() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <span className="mb-2 grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <Construction className="size-5" />
        </span>
        <CardTitle>Teknisyen oturumu hazır</CardTitle>
        <CardDescription>
          Rolünüz güvenli biçimde doğrulandı. Teknik servis kuyruğu bir sonraki
          geliştirme diliminde bu alana eklenecek.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Şimdilik oturumu sağ üstteki düğmeden güvenle kapatabilirsiniz.
      </CardContent>
    </Card>
  );
}
