import { notFound } from 'next/navigation';
import Portals from '../../../components/Portals';
import type { PortalType } from '../../../components/Portals';

const PORTAL_SLUGS: readonly PortalType[] = ['client', 'employee', 'freelancer', 'hris'];

type Props = { params: Promise<{ portal: string }> };

export default async function HubPortalPage({ params }: Props) {
  const { portal: raw } = await params;
  if (!(PORTAL_SLUGS as readonly string[]).includes(raw)) {
    notFound();
  }
  const portal = raw as PortalType;
  return <Portals key={portal} initialPortal={portal} urlSync />;
}
