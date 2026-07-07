import Link from 'next/link';
import { Home, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-9xl font-bold text-gradient">404</div>
        <Music2 className="h-20 w-20 mx-auto text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Bài hát không tìm thấy</h1>
          <p className="text-muted-foreground">
            Có thể bài hát đã bị gỡ hoặc trang không tồn tại. Quay lại trang chủ và tiếp tục hát thôi!
          </p>
        </div>
        <Link href="/home">
          <Button variant="gradient" size="lg">
            <Home className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
