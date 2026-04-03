/**
 * Central icon registry — all Lucide imports live here.
 *
 * Rules:
 *  - Import from this file, never directly from lucide-react
 *  - Stroke-only variants exclusively (no filled icons)
 *  - strokeWidth: 1.5 is the canonical default (override per context)
 *  - All icons inherit currentColor — never hardcode icon fill/stroke
 *
 * Sizing convention:
 *  - 16px  inline / body context
 *  - 18px  navigation items
 *  - 20px  action buttons, quick actions
 *  - 24px  empty states, hero indicators
 */

export {
  /* Navigation */
  Home,
  Briefcase,
  Users,
  Building2,
  FolderKanban,
  UserPlus,
  DollarSign,
  Headphones,
  Settings,
  ClipboardList,
  PanelLeftClose,
  PanelLeft,

  /* Actions */
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  LogOut,
  Command,
  X,
  Check,
  Copy,
  Trash2,
  Pencil,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Link,
  Filter,
  SlidersHorizontal,
  MoreHorizontal,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,

  /* People / Social */
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,

  /* Data / Charts */
  BarChart3,
  BarChart2,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  Gauge,

  /* Files / Docs */
  FileText,
  File,
  Folder,
  FolderOpen,
  Paperclip,
  Image,

  /* Status / Feedback */
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Loader2,
  Sparkles,
  Zap,

  /* Comms / Workflow */
  MessageSquare,
  MessageCircle,
  Send,
  Inbox,
  Archive,
  Tag,
  Bookmark,
  Flag,

  /* Layout */
  LayoutGrid,
  List,
  Columns,
  Rows,
  Maximize2,
  Minimize2,
  Grid3x3,

  /* Misc */
  Globe,
  Shield,
  Key,
  Database,
  Server,
  Cpu,
  Package,
  Box,
  Layers,
  Workflow,
  GitBranch,
  Hash,
  AtSign,
} from 'lucide-react';
