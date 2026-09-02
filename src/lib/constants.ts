export const STORE = {
  name: 'Little Buds Darjeeling',
  tagline: "Proudly presented by Prayashpriye Kid's Zone – Your Trusted Kids' Clothing Store",
  storeName: 'Prayashpriye Kid\u2019s Zone',
  address: "New Market - S Building, Shop No. 19, Darjeeling, West Bengal, India, 734101",
  shortAddress: "New Market - S Building, Shop No. 19, Darjeeling",
  phones: ['+91 70016 45143', '+91 87591 61518'],
  whatsapp: '917001645143',
  whatsappMessage: "Hi, I\u2019m interested in kids\u2019 clothes from your store.",
  hours: '10:30 AM - 6:30 PM (Thursday closed)',
  deliveryZone: 'Free delivery in Darjeeling town and nearby areas. For other areas, please contact us on WhatsApp or call +91 70016 45143.',
  deliveryEstimate: 'Estimated delivery: 1\u20132 days within Darjeeling.',
  upiId: 'littlebuds@okhdfcbank',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3564.5!2d88.2667!3d27.0418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNew+Market+Darjeeling!5e0!3m2!1sen!2sin!4v1600000000000',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=New+Market+Darjeeling',
  deliveryPincodes: ['734101', '734102', '734103', '734401', '734402'],
};

export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? STORE.whatsappMessage);
  return `https://wa.me/${STORE.whatsapp}?text=${text}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`;
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPriceDecimal(price: number): string {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatAgeRangeForDisplay(ageRange: string | null): string {
  if (!ageRange) return '';
  return ageRange
    .replace(/M/g, ' Months')
    .replace(/Y/g, ' Years')
    .replace(/(\d+) Months/g, '$1 Month')
    .replace(/(\d+) Years/g, '$1 Year');
}
