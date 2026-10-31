import React, { useState } from 'react';
import { BookOpen, ExternalLink, Info, X } from 'lucide-react';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';

interface ApiSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUri?: string;
}

export const ApiSetupGuideModal: React.FC<ApiSetupGuideModalProps> = ({
  isOpen,
  onClose,
  redirectUri,
}) => {
  const [guideActivePlatform, setGuideActivePlatform] = useState<
    'youtube' | 'instagram' | 'facebook' | 'tiktok'
  >('youtube');
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);

  if (!isOpen) return null;

  const resolvedRedirectUri =
    redirectUri ||
    (typeof window !== 'undefined' ? `${window.location.origin}/api/tiktok/callback` : '');

  const handleCopyRedirectUri = () => {
    if (!resolvedRedirectUri) return;
    navigator.clipboard.writeText(resolvedRedirectUri);
    setCopiedRedirectUri(true);
    setTimeout(() => setCopiedRedirectUri(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                คู่มือการขอ API & Token ทั้ง 4 แพลตฟอร์ม
              </h3>
              <p className="text-xs text-slate-300">
                ขั้นตอนการรับ Official Credentials สำหรับช่อง "จุ๊ยจุ๊ย" แบบละเอียดทีละขั้นตอน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'youtube', label: 'YouTube API v3', icon: 'youtube' },
            { id: 'facebook', label: 'Facebook Page API', icon: 'facebook' },
            { id: 'instagram', label: 'Instagram Graph API', icon: 'instagram' },
            { id: 'tiktok', label: 'TikTok Open API', icon: 'tiktok' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setGuideActivePlatform(
                  tab.id as 'youtube' | 'instagram' | 'facebook' | 'tiktok'
                )
              }
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                guideActivePlatform === tab.id
                  ? 'border-violet-600 text-violet-900 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlatformBrandIcon platform={tab.icon} size="xs" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* YouTube Guide */}
          {guideActivePlatform === 'youtube' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">ระดับความยาก: ง่ายมาก (ใช้เวลา 3 นาที)</span>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    YouTube API ใช้งานฟรี มีโควตา 10,000 units ต่อวัน (ดึงได้นับพันครั้งต่อวันสบายๆ) ไม่ต้องรอรีวิวจาก Google
                  </p>
                </div>
              </div>

              <h5 className="font-bold text-slate-900 text-sm">ขั้นตอนการขอ YouTube API Key:</h5>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  ไปที่{' '}
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  และเข้าสู่ระบบด้วยบัญชี Google
                </li>
                <li>
                  สร้าง Project ใหม่ (หรือเลือก Project เดิมที่มีอยู่) ที่เมนูด้านบนซ้าย
                </li>
                <li>
                  ไปที่เมนู <strong>APIs & Services &gt; Library</strong> ค้นหาคำว่า{' '}
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
                    YouTube Data API v3
                  </code>{' '}
                  แล้วกดปุ่ม <strong>Enable</strong>
                </li>
                <li>
                  ไปที่ <strong>APIs & Services &gt; Credentials</strong> คลิกปุ่ม{' '}
                  <strong>+ Create Credentials &gt; API key</strong>
                </li>
                <li>
                  คัดลอกรหัสที่ขึ้นต้นด้วย{' '}
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
                    AIzaSy...
                  </code>{' '}
                  มาใส่ในช่อง <strong>YouTube API Key</strong> ในหน้าแอดมินนี้
                </li>
                <li>
                  <strong>Channel ID / Handle:</strong> ใส่{' '}
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
                    @JUIJUIChannel
                  </code>{' '}
                  หรือ Channel ID ที่ได้จาก YouTube Studio &gt; Settings &gt; Channel &gt; Advanced settings
                </li>
              </ol>
            </div>
          )}

          {/* Facebook Guide */}
          {guideActivePlatform === 'facebook' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">ระดับความยาก: ปานกลาง (ใช้เวลา 5-8 นาที)</span>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    ต้องเป็นผู้ดูแล (Admin) ของแฟนเพจ "จุ๊ยจุ๊ย จุ๊ย" บน Facebook
                  </p>
                </div>
              </div>

              <h5 className="font-bold text-slate-900 text-sm">ขั้นตอนการขอ Facebook Page Token:</h5>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  ไปที่{' '}
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Meta for Developers <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  ล็อกอินด้วย Facebook ที่เป็นแอดมินเพจ
                </li>
                <li>
                  ไปที่ <strong>My Apps &gt; Create App</strong> เลือกประเภท Use case เป็น{' '}
                  <strong>Other</strong> หรือ <strong>Business</strong> แล้วตั้งชื่อ App
                </li>
                <li>
                  เปิดเครื่องมือ{' '}
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Graph API Explorer <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  ที่เมนูด้านขวา:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>ช่อง <strong>Meta App:</strong> เลือก App ที่สร้างไว้</li>
                    <li>ช่อง <strong>User or Page:</strong> คลิกเลือก <strong>เพจ จุ๊ยจุ๊ย จุ๊ย</strong></li>
                    <li>
                      ช่อง <strong>Permissions:</strong> เพิ่มสิทธิ์{' '}
                      <code className="px-1 bg-slate-100 rounded font-mono">pages_read_engagement</code>,{' '}
                      <code className="px-1 bg-slate-100 rounded font-mono">pages_show_list</code>
                    </li>
                  </ul>
                </li>
                <li>
                  คลิกปุ่ม <strong>Generate Access Token</strong> แล้วกดยืนยันสิทธิ์กับเพจ
                </li>
                <li>
                  คัดลอก Token (ขึ้นต้นด้วย EAAB...) มาวางในช่อง <strong>Page Access Token</strong>
                </li>
                <li>
                  <strong>Page ID:</strong> ดูได้ที่หน้าแฟนเพจ เมนู <em>About (เกี่ยวกับ) &gt; Page transparency</em> หรือใช้ชื่อ url ของเพจ
                </li>
              </ol>
            </div>
          )}

          {/* Instagram Guide */}
          {guideActivePlatform === 'instagram' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-fuchsia-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">เงื่อนไขสำคัญก่อนเริ่ม:</span>
                  <p className="text-[11px] text-fuchsia-800 mt-0.5">
                    บัญชี Instagram ของจุ๊ยจุ๊ยต้องเป็นประเภท <strong>Creator หรือ Business Account</strong> และต้องเชื่อมโยงเข้ากับ Facebook Page แล้ว (ทำได้ใน Instagram Settings &gt; Account &gt; Linked Accounts)
                  </p>
                </div>
              </div>

              <h5 className="font-bold text-slate-900 text-sm">ขั้นตอนการขอ Instagram Token & IG User ID:</h5>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  สร้าง App บน{' '}
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Meta for Developers <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  (ใช้ App เดียวกับของ Facebook ได้)
                </li>
                <li>
                  เปิดเครื่องมือ{' '}
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Graph API Explorer <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  เพิ่ม Permissions ต่อไปนี้:
                  <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[11px]">
                    <span className="px-2 py-0.5 bg-slate-100 rounded border">instagram_basic</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded border">instagram_manage_insights</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded border">pages_show_list</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded border">pages_read_engagement</span>
                  </div>
                </li>
                <li>
                  คลิกปุ่ม <strong>Generate Access Token</strong>
                </li>
                <li>
                  <strong>วิธีหา IG User ID:</strong> สามารถกดปุ่ม <strong>"✨ ค้นหา ID อัตโนมัติ"</strong> ในการ์ด Instagram หรือใน Graph API Explorer พิมพ์คำสั่ง{' '}
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-violet-700">
                    me/accounts?fields=instagram_business_account&#123;id,username&#125;
                  </code>{' '}
                  แล้วกด Submit จะได้รับ ID ตัวเลข 17 หลัก (เช่น 178414000...)
                </li>
                <li>
                  คัดลอก Token และ IG User ID มาวางในช่องของ Instagram
                </li>
                <li>
                  <em>คำแนะนำ:</em> Token เริ่มต้นมีอายุ 1-2 ชั่วโมง คุณสามารถขยายเป็น Long-lived Token (อายุ 60 วัน) ได้ที่{' '}
                  <a
                    href="https://developers.facebook.com/tools/accesstoken/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 underline font-bold"
                  >
                    Access Token Tool
                  </a>
                </li>
              </ol>
            </div>
          )}

          {/* TikTok Guide */}
          {guideActivePlatform === 'tiktok' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">เชื่อมต่อง่ายผ่าน Official OAuth 2.0 (Connect TikTok)</span>
                  <p className="text-[11px] text-violet-800 mt-0.5">
                    ระบบใหม่นี้รองรับทั้ง <strong>Sandbox Mode (ทดสอบระหว่างพัฒนา)</strong> และ <strong>Production Mode</strong> โดยผู้ดูแลระบบไม่ต้องคัดลอก Access Token มาวางเอง เพียงกดปุ่มเดียวระบบจะเชื่อมต่อและรีเฟรชสิทธิ์ให้อัตโนมัติ
                  </p>
                </div>
              </div>

              <h5 className="font-bold text-slate-900 text-sm">ขั้นตอนการติดตั้ง TikTok OAuth 2.0 (รวม Sandbox Mode):</h5>
              <ol className="list-decimal pl-5 space-y-2.5">
                <li>
                  ไปที่{' '}
                  <a
                    href="https://developers.tiktok.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    TikTok for Developers <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  และเข้าสู่ระบบด้วยบัญชีผู้พัฒนา
                </li>
                <li>
                  คลิก <strong>Manage Apps &gt; Create App</strong> และตั้งชื่อแอปของคุณ
                </li>
                <li>
                  ในเมนู <strong>App Details &gt; Redirect domains</strong>:
                  <div className="p-2 my-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between">
                    <span>{resolvedRedirectUri}</span>
                    <button
                      type="button"
                      onClick={handleCopyRedirectUri}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white cursor-pointer hover:bg-slate-800 shrink-0"
                    >
                      {copiedRedirectUri ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    *นำ URL ด้านบนนี้ไปวางในช่อง Redirect domain หรือ Redirect URL ของ TikTok
                  </span>
                </li>
                <li>
                  เพิ่มผลิตภัณฑ์ <strong>Login Kit</strong> หรือ <strong>Display API</strong> และเลือก Scopes:
                  <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[11px]">
                    <span className="px-2 py-0.5 bg-slate-100 rounded border">user.info.basic</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded border">user.info.stats</span>
                  </div>
                </li>
                <li>
                  <strong>การตั้งค่าโหมดทดสอบ (Sandbox Mode - ไม่ต้องรอ App Review):</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li>ไปที่แท็บ <strong>Roles &amp; Access &gt; Sandbox Testers</strong></li>
                    <li>
                      คลิก <strong>+ Add Sandbox Tester</strong> แล้วกรอก Username ช่อง TikTok ของคุณ (เช่น{' '}
                      <code className="text-violet-700 font-bold font-mono">@juijui.j</code>)
                    </li>
                    <li>เปิดแอป TikTok ในสมาร์ตโฟน &gt; กล่องข้อความ (Inbox) จาก TikTok แล้วกดยืนยันคำขอเป็น Tester</li>
                  </ul>
                </li>
                <li>
                  คัดลอก <strong>Client Key</strong> และ <strong>Client Secret</strong> จากหน้า TikTok Developer Console มากรอกในกล่อง "ตั้งค่า TikTok Client Credentials" ในหน้านี้ แล้วกด <strong>"บันทึกการตั้งค่า"</strong>
                </li>
                <li>
                  คลิกปุ่ม <strong>"เชื่อมต่อบัญชี TikTok (Connect TikTok)"</strong> ในหน้าแอดมินนี้ หน้าต่าง Popup จะเปิดขึ้นเพื่อให้คุณล็อกอินและกดยืนยันสิทธิ์ เมื่อสำเร็จระบบจะดึงยอดผู้ติดตามและสถิติจริงมาใช้งานทันที!
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ข้อมูล API Key ทั้งหมดจะถูกจัดเก็บในเครื่องเบราว์เซอร์ของคุณอย่างปลอดภัย (Local Storage)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
