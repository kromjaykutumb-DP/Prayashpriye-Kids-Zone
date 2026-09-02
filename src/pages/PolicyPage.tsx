import { useParams, Link } from 'react-router-dom';
import { Truck, RefreshCw, Shield, FileText, ArrowLeft } from 'lucide-react';
import { STORE } from '@/lib/constants';

const policyContent: Record<string, { title: string; icon: typeof Truck; sections: { heading: string; body: string }[] }> = {
  delivery: {
    title: 'Delivery & Shipping',
    icon: Truck,
    sections: [
      {
        heading: 'Free Delivery in Darjeeling',
        body: `We offer free delivery within Darjeeling town and nearby areas. There are no minimum order requirements and no shipping charges for deliveries within our service zone.`,
      },
      {
        heading: 'Delivery Areas',
        body: `Free delivery covers Darjeeling town and nearby areas (PIN codes: ${STORE.deliveryPincodes.join(', ')}). If you're outside these areas, please contact us on WhatsApp or call ${STORE.phones[0]} and we'll do our best to arrange delivery.`,
      },
      {
        heading: 'Delivery Timeline',
        body: `Orders within Darjeeling are typically delivered within 1-2 business days. You'll receive a confirmation call or WhatsApp message before delivery.`,
      },
      {
        heading: 'Order Processing',
        body: `Orders are processed during our business hours: ${STORE.hours}. Orders placed outside business hours will be processed the next business day.`,
      },
      {
        heading: 'Outside Darjeeling',
        body: `Currently, we only offer free delivery within Darjeeling. For deliveries to other locations, please contact us and we'll discuss shipping options and any applicable charges.`,
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    icon: RefreshCw,
    sections: [
      {
        heading: '7-Day Exchange Policy',
        body: `We offer easy exchanges within 7 days of delivery. Items must be unworn, unwashed, and in their original condition with tags intact.`,
      },
      {
        heading: 'How to Request an Exchange',
        body: `To request an exchange, contact us via WhatsApp or phone within 7 days of receiving your order. We'll guide you through the process and arrange pickup if needed.`,
      },
      {
        heading: 'Refunds',
        body: `For eligible returns, we offer store credit or exchange for another product of equal or lesser value. Cash refunds are available for damaged or incorrect items only.`,
      },
      {
        heading: 'Non-Returnable Items',
        body: `Innerwear, socks, and items on clearance sale are not eligible for exchange or return for hygiene and clearance reasons.`,
      },
      {
        heading: 'Damaged or Wrong Items',
        body: `If you receive a damaged or incorrect item, please contact us immediately with a photo. We'll arrange a replacement or refund at no cost to you.`,
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    sections: [
      {
        heading: 'Information We Collect',
        body: `We collect your name, phone number, WhatsApp number, email (if provided), and delivery address when you place an order. This information is used solely to process and deliver your order.`,
      },
      {
        heading: 'How We Use Your Information',
        body: `Your information is used to process orders, arrange delivery, contact you about your order, and provide customer support. We do not sell or share your personal information with third parties.`,
      },
      {
        heading: 'Data Storage',
        body: `Your order information is stored securely and is accessible only to authorized store personnel. Account information (if you create one) is protected by your password.`,
      },
      {
        heading: 'WhatsApp & Phone Communication',
        body: `By providing your phone number, you consent to being contacted via WhatsApp or phone regarding your orders. You can opt out of promotional messages at any time.`,
      },
      {
        heading: 'Your Rights',
        body: `You can request access to, correction of, or deletion of your personal data by contacting us. Guest checkout data is retained for order records but not used for marketing.`,
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    sections: [
      {
        heading: 'Acceptance of Terms',
        body: `By using our website and placing orders, you agree to these terms of service. If you do not agree, please do not use our online store.`,
      },
      {
        heading: 'Product Information',
        body: `We strive to display accurate product information, including images, sizes, and prices. However, colors may vary slightly due to screen settings, and product availability may change.`,
      },
      {
        heading: 'Pricing & Payment',
        body: `All prices are in Indian Rupees (INR) and include applicable taxes. We accept Cash on Delivery, UPI (GPay/PhonePe/Paytm), and card payments. Prices may change without notice.`,
      },
      {
        heading: 'Order Acceptance',
        body: `We reserve the right to accept or decline any order. If we cannot fulfill your order (e.g., out of stock), we will contact you and offer an alternative or refund.`,
      },
      {
        heading: 'Delivery',
        body: `Free delivery is limited to Darjeeling town and nearby areas. Delivery timelines are estimates. We are not liable for delays due to weather or circumstances beyond our control.`,
      },
      {
        heading: 'Account Security',
        body: `If you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.`,
      },
      {
        heading: 'Contact',
        body: `For any questions about these terms, contact us at ${STORE.phones[0]} or visit our store at ${STORE.address}.`,
      },
    ],
  },
};

export default function PolicyPage() {
  const { type } = useParams<{ type: string }>();
  const policy = policyContent[type ?? 'delivery'];

  if (!policy) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-600">Policy page not found.</p>
        <Link to="/" className="btn-primary mt-4">Back Home</Link>
      </div>
    );
  }

  const Icon = policy.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mb-4">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
          <Icon size={28} className="text-teal-600" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">{policy.title}</h1>
      </div>

      <div className="space-y-6">
        {policy.sections.map((section, i) => (
          <div key={i} className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-2">{section.heading}</h2>
            <p className="text-ink-700 leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-2xl bg-teal-50 text-center">
        <p className="text-sm text-teal-700">
          Questions? Call us at {STORE.phones.join(' or ')} or visit our store at {STORE.shortAddress}.
        </p>
      </div>
    </div>
  );
}
