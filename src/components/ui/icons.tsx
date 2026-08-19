import type {
  ComponentType,
  CSSProperties,
  ElementType,
  HTMLAttributes,
} from 'react'
import {
  ApiOutlined,
  AppstoreOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  AuditOutlined,
  BankOutlined,
  BellOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  ControlOutlined,
  CopyOutlined,
  DashboardOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
  DesktopOutlined,
  DollarOutlined,
  DownOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FallOutlined,
  FieldTimeOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  LeftOutlined,
  LoadingOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  MessageOutlined,
  MinusOutlined,
  NumberOutlined,
  PaperClipOutlined,
  PhoneOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  RadarChartOutlined,
  ReloadOutlined,
  RightOutlined,
  RiseOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  ShareAltOutlined,
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  TrophyOutlined,
  UserOutlined,
  WarningOutlined,
  WechatOutlined,
} from '@ant-design/icons'

export interface IconProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'color'
> {
  size?: number | string
  color?: string
  strokeWidth?: number
  style?: CSSProperties
}

export type AppIcon = ComponentType<IconProps>

type AntIconComponent = ElementType

function createIcon(AntIcon: AntIconComponent): AppIcon {
  return function Icon({
    size = 16,
    color,
    strokeWidth: _strokeWidth,
    style,
    ...props
  }: IconProps) {
    return (
      <AntIcon
        {...props}
        style={{
          color,
          fontSize: size,
          lineHeight: 1,
          ...style,
        }}
      />
    )
  }
}

export const Activity = createIcon(DashboardOutlined)
export const AlertCircle = createIcon(ExclamationCircleOutlined)
export const AlertTriangle = createIcon(WarningOutlined)
export const ArrowLeft = createIcon(ArrowLeftOutlined)
export const ArrowRight = createIcon(ArrowRightOutlined)
export const Award = createIcon(TrophyOutlined)
export const Bell = createIcon(BellOutlined)
export const Bot = createIcon(RobotOutlined)
export const Building2 = createIcon(BankOutlined)
export const CalendarClock = createIcon(ScheduleOutlined)
export const CalendarDays = createIcon(CalendarOutlined)
export const Check = createIcon(CheckOutlined)
export const CheckCheck = createIcon(CheckCircleOutlined)
export const CheckCircle = createIcon(CheckCircleOutlined)
export const CheckCircle2 = createIcon(CheckCircleOutlined)
export const ChevronDown = createIcon(DownOutlined)
export const ChevronLeft = createIcon(LeftOutlined)
export const ChevronRight = createIcon(RightOutlined)
export const ClipboardList = createIcon(AuditOutlined)
export const Clock = createIcon(ClockCircleOutlined)
export const Clock3 = createIcon(ClockCircleOutlined)
export const Construction = createIcon(ToolOutlined)
export const Copy = createIcon(CopyOutlined)
export const Cpu = createIcon(DesktopOutlined)
export const DollarSign = createIcon(DollarOutlined)
export const Download = createIcon(DownloadOutlined)
export const ExternalLink = createIcon(ExportOutlined)
export const Eye = createIcon(EyeOutlined)
export const EyeOff = createIcon(EyeInvisibleOutlined)
export const FileText = createIcon(FileTextOutlined)
export const Gauge = createIcon(DashboardOutlined)
export const Hash = createIcon(NumberOutlined)
export const Home = createIcon(HomeOutlined)
export const Info = createIcon(InfoCircleOutlined)
export const KeyRound = createIcon(KeyOutlined)
export const Layers3 = createIcon(AppstoreOutlined)
export const Loader2 = createIcon(LoadingOutlined)
export const LoaderCircle = createIcon(LoadingOutlined)
export const Lock = createIcon(LockOutlined)
export const LogOut = createIcon(LogoutOutlined)
export const Mail = createIcon(MailOutlined)
export const Menu = createIcon(MenuOutlined)
export const MessageCircle = createIcon(MessageOutlined)
export const MessageSquare = createIcon(MessageOutlined)
export const MessageSquareText = createIcon(CommentOutlined)
export const MessagesSquare = createIcon(WechatOutlined)
export const Minus = createIcon(MinusOutlined)
export const Paperclip = createIcon(PaperClipOutlined)
export const Pencil = createIcon(EditOutlined)
export const PhoneCall = createIcon(PhoneOutlined)
export const PlayCircle = createIcon(PlayCircleOutlined)
export const Plug = createIcon(ApiOutlined)
export const PlugZap = createIcon(ThunderboltOutlined)
export const Plus = createIcon(PlusOutlined)
export const Radio = createIcon(RadarChartOutlined)
export const RefreshCw = createIcon(ReloadOutlined)
export const RotateCcw = createIcon(ReloadOutlined)
export const ScrollText = createIcon(FileSearchOutlined)
export const Search = createIcon(SearchOutlined)
export const SearchCheck = createIcon(FileSearchOutlined)
export const Send = createIcon(SendOutlined)
export const Settings2 = createIcon(SettingOutlined)
export const Share2 = createIcon(ShareAltOutlined)
export const Shield = createIcon(SafetyCertificateOutlined)
export const ShieldCheck = createIcon(SafetyCertificateOutlined)
export const SlidersHorizontal = createIcon(ControlOutlined)
export const Sparkles = createIcon(BulbOutlined)
export const Tag = createIcon(TagOutlined)
export const Tags = createIcon(TagsOutlined)
export const TimerReset = createIcon(FieldTimeOutlined)
export const Trash2 = createIcon(DeleteOutlined)
export const TrendingDown = createIcon(FallOutlined)
export const TrendingUp = createIcon(RiseOutlined)
export const User = createIcon(UserOutlined)
export const UserRound = createIcon(UserOutlined)
export const Users = createIcon(TeamOutlined)
export const UsersRound = createIcon(TeamOutlined)
export const Workflow = createIcon(DeploymentUnitOutlined)
export const X = createIcon(CloseOutlined)
export const XCircle = createIcon(CloseCircleOutlined)
export const Zap = createIcon(ThunderboltOutlined)
