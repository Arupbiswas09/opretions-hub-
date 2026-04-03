import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { HUB_MODULES, type HubModule } from '../../lib/hub-modules';
import Dashboard from '../../components/Dashboard';
import Sales from '../../components/Sales';
import Contacts from '../../components/Contacts';
import Clients from '../../components/Clients';
import Projects from '../../components/Projects';
import Talent from '../../components/Talent';
import People from '../../components/People';
import Finance from '../../components/Finance';
import Support from '../../components/Support';
import Forms from '../../components/Forms';
import Admin from '../../components/Admin';

const MODULE_MAP: Record<HubModule, ReactNode> = {
  dashboard: <Dashboard />,
  sales: <Sales />,
  contacts: <Contacts />,
  clients: <Clients />,
  projects: <Projects />,
  talent: <Talent />,
  people: <People />,
  finance: <Finance />,
  support: <Support />,
  forms: <Forms />,
  admin: <Admin />,
};

type Props = { params: Promise<{ module: string }> };

export default async function HubModulePage({ params }: Props) {
  const { module: raw } = await params;
  if (!(HUB_MODULES as readonly string[]).includes(raw)) {
    notFound();
  }
  const module = raw as HubModule;
  return MODULE_MAP[module];
}
