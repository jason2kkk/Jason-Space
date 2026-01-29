import { 
  HomeIcon, 
  MailIcon, 
  PhoneIcon,
  HeartIcon,
} from "lucide-react";
import { Toast } from '../components/ui/toast';
import ReactDOM from 'react-dom/client';

const copyToClipboard = async (text, message) => {
  try {
    await navigator.clipboard.writeText(text);
    const toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
    
    const root = ReactDOM.createRoot(toast);
    root.render(
      <Toast 
        message={message}
        onClose={() => {
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
            root.unmount();
          }, 800);
        }} 
      />
    );
  } catch (err) {
    console.error('复制失败:', err);
  }
};

export const getDockItems = (lang, t) => [
  {
    title: t.backToTop,
    icon: <HomeIcon className="w-6 h-6" />,
    onClick: () => {
      window.scrollTo({ 
        top: 0, 
        behavior: "smooth",
      });
    }
  },
  {
    type: 'separator',
    className: "h-8 w-px bg-gray-200 mx-2"
  },
  {
    title: t.email,
    icon: <MailIcon className="w-6 h-6" />,
    onClick: () => copyToClipboard('jason2k@126.com', t.copyEmail)
  },
  {
    title: t.phone,
    icon: <PhoneIcon className="w-6 h-6" />,
    onClick: () => copyToClipboard('17666003839', t.copyPhone)
  },
  {
    title: t.xiaohongshu,
    icon: <HeartIcon className="w-6 h-6" />,
    href: "https://www.xiaohongshu.com/user/profile/5b7d47aaf7e8b97c7eec8b13",
    target: "_blank"
  }
]; 
