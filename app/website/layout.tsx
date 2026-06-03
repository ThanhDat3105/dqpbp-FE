import WebsiteHeader from '@/components/website/WebsiteHeader';
import WebsiteFooter from '@/components/website/WebsiteFooter';
import ChatFAB from '@/components/website/ChatFAB';

export const metadata = {
  title: 'BCH Quân Sự Phường Bình Phú',
  description: 'Trang thông tin chính thức của Ban Chỉ Huy Quân Sự Phường Bình Phú, TP.HCM',
};

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <WebsiteHeader />
      <main className="flex-1">{children}</main>
      <WebsiteFooter />
      <ChatFAB />
    </div>
  );
}
