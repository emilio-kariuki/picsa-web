import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { HugeiconsIcon, type HugeiconsProps, type IconSvgElement } from '@hugeicons/react'
import {
  Activity as ActivitySvg,
  ActivityIcon as ActivityIconSvg,
  AlertCircleIcon as AlertCircleIconSvg,
  AlertTriangle as AlertTriangleSvg,
  ArchiveIcon as ArchiveIconSvg,
  ArrowDownIcon as ArrowDownIconSvg,
  ArrowLeft as ArrowLeftSvg,
  ArrowLeftIcon as ArrowLeftIconSvg,
  ArrowRight as ArrowRightSvg,
  ArrowRightIcon as ArrowRightIconSvg,
  ArrowUpDownIcon as ArrowUpDownIconSvg,
  ArrowUpIcon as ArrowUpIconSvg,
  Bell as BellSvg,
  BellRing as BellRingSvg,
  BotIcon as BotIconSvg,
  BuildingIcon as BuildingIconSvg,
  CalendarDays as CalendarDaysSvg,
  CalendarIcon as CalendarIconSvg,
  CameraIcon as CameraIconSvg,
  Check as CheckSvg,
  CheckCheck as CheckCheckSvg,
  CheckmarkCircle02Icon as CheckmarkCircle02IconSvg,
  ChevronDown as ChevronDownSvg,
  ChevronLeft as ChevronLeftSvg,
  ChevronRight as ChevronRightSvg,
  ChevronUp as ChevronUpSvg,
  ChevronsLeft as ChevronsLeftSvg,
  ChevronsRight as ChevronsRightSvg,
  ChevronsUpDown as ChevronsUpDownSvg,
  CircleAlert as CircleAlertSvg,
  CircleIcon as CircleIconSvg,
  ClipboardList as ClipboardListSvg,
  Clock3 as Clock3Svg,
  CloudIcon as CloudIconSvg,
  CloudUploadIcon as CloudUploadIconSvg,
  CopyIcon as CopyIconSvg,
  CreditCardIcon as CreditCardIconSvg,
  Crown as CrownSvg,
  DollarSign as DollarSignSvg,
  ExternalLink as ExternalLinkSvg,
  EyeIcon as EyeIconSvg,
  ViewOffSlashIcon as EyeOffIconSvg,
  FileText as FileTextSvg,
  FilterIcon as FilterIconSvg,
  FolderKanbanIcon as FolderKanbanIconSvg,
  Github as GithubSvg,
  GlobeIcon as GlobeIconSvg,
  GripVertical as GripVerticalSvg,
  HardDriveIcon as HardDriveIconSvg,
  HardDriveUpload as HardDriveUploadSvg,
  History as HistorySvg,
  HomeIcon as HomeIconSvg,
  ImageIcon as ImageIconSvg,
  ImagePlus as ImagePlusSvg,
  Images as ImagesSvg,
  Instagram as InstagramSvg,
  KeyIcon as KeyIconSvg,
  LayoutDashboard as LayoutDashboardSvg,
  LifeBuoy as LifeBuoySvg,
  Link2 as Link2Svg,
  Loader as LoaderSvg,
  LoaderCircle as LoaderCircleSvg,
  Lock as LockSvg,
  LockIcon as LockIconSvg,
  LogOut as LogOutSvg,
  Mail as MailSvg,
  MailCheck as MailCheckSvg,
  MailPlus as MailPlusSvg,
  MegaphoneIcon as MegaphoneIconSvg,
  Menu as MenuSvg,
  MenuIcon as MenuIconSvg,
  MessageCircle as MessageCircleSvg,
  MessageSquare as MessageSquareSvg,
  Minus as MinusSvg,
  MoonIcon as MoonIconSvg,
  MoreHorizontal as MoreHorizontalSvg,
  MoreHorizontalIcon as MoreHorizontalIconSvg,
  PackageIcon as PackageIconSvg,
  PanelLeftIcon as PanelLeftIconSvg,
  Play as PlaySvg,
  Plus as PlusSvg,
  RefreshCcw as RefreshCcwSvg,
  RefreshCw as RefreshCwSvg,
  SaveIcon as SaveIconSvg,
  Scale as ScaleSvg,
  ScanSearch as ScanSearchSvg,
  SearchIcon as SearchIconSvg,
  Send as SendSvg,
  Settings2 as Settings2Svg,
  SettingsIcon as SettingsIconSvg,
  ShieldAlert as ShieldAlertSvg,
  ShieldCheck as ShieldCheckSvg,
  ShieldIcon as ShieldIconSvg,
  ShieldOff as ShieldOffSvg,
  Smartphone as SmartphoneSvg,
  Sparkles as SparklesSvg,
  SparklesIcon as SparklesIconSvg,
  SunIcon as SunIconSvg,
  TicketIcon as TicketIconSvg,
  Trash2 as Trash2Svg,
  Twitter as TwitterSvg,
  UserCheckIcon as UserCheckIconSvg,
  UserCog as UserCogSvg,
  UserPlus as UserPlusSvg,
  UserRound as UserRoundSvg,
  Users as UsersSvg,
  Workflow as WorkflowSvg,
  X as XSvg,
  XCircle as XCircleSvg,
} from '@hugeicons/core-free-icons'

export type IconProps = Omit<
  ComponentPropsWithoutRef<'svg'>,
  'color' | 'strokeWidth'
> &
  Omit<
    HugeiconsProps,
    'icon' | 'altIcon' | 'ref' | 'strokeWidth'
  > & {
    color?: string
    strokeWidth?: string | number
  }

function createIcon(icon: IconSvgElement) {
  return forwardRef<SVGSVGElement, IconProps>(function HugeIcon(props, ref) {
    const { strokeWidth, ...rest } = props
    const resolvedStrokeWidth =
      typeof strokeWidth === 'string'
        ? Number.parseFloat(strokeWidth)
        : strokeWidth

    return (
      <HugeiconsIcon
        ref={ref}
        icon={icon}
        strokeWidth={Number.isFinite(resolvedStrokeWidth) ? resolvedStrokeWidth : 1.8}
        {...rest}
      />
    )
  })
}

export const Activity = createIcon(ActivitySvg)
export const ActivityIcon = createIcon(ActivityIconSvg)
export const AlertCircleIcon = createIcon(AlertCircleIconSvg)
export const ArchiveIcon = createIcon(ArchiveIconSvg)
export const ArrowDownIcon = createIcon(ArrowDownIconSvg)
export const ArrowLeft = createIcon(ArrowLeftSvg)
export const ArrowLeftIcon = createIcon(ArrowLeftIconSvg)
export const ArrowRight = createIcon(ArrowRightSvg)
export const ArrowRightIcon = createIcon(ArrowRightIconSvg)
export const ArrowUpDownIcon = createIcon(ArrowUpDownIconSvg)
export const ArrowUpIcon = createIcon(ArrowUpIconSvg)
export const BellIcon = createIcon(BellSvg)
export const BellRingIcon = createIcon(BellRingSvg)
export const BotIcon = createIcon(BotIconSvg)
export const BuildingIcon = createIcon(BuildingIconSvg)
export const CalendarDaysIcon = createIcon(CalendarDaysSvg)
export const CalendarIcon = createIcon(CalendarIconSvg)
export const CameraIcon = createIcon(CameraIconSvg)
export const Check = createIcon(CheckSvg)
export const CheckCheckIcon = createIcon(CheckCheckSvg)
export const CheckCircle2Icon = createIcon(CheckmarkCircle02IconSvg)
export const CheckIcon = createIcon(CheckSvg)
export const ChevronDown = createIcon(ChevronDownSvg)
export const ChevronDownIcon = createIcon(ChevronDownSvg)
export const ChevronLeftIcon = createIcon(ChevronLeftSvg)
export const ChevronRight = createIcon(ChevronRightSvg)
export const ChevronRightIcon = createIcon(ChevronRightSvg)
export const ChevronUpIcon = createIcon(ChevronUpSvg)
export const ChevronsLeftIcon = createIcon(ChevronsLeftSvg)
export const ChevronsRightIcon = createIcon(ChevronsRightSvg)
export const ChevronsUpDownIcon = createIcon(ChevronsUpDownSvg)
export const CircleAlertIcon = createIcon(CircleAlertSvg)
export const CircleIcon = createIcon(CircleIconSvg)
export const ClipboardListIcon = createIcon(ClipboardListSvg)
export const Clock3 = createIcon(Clock3Svg)
export const Clock3Icon = createIcon(Clock3Svg)
export const CopyIcon = createIcon(CopyIconSvg)
export const CreditCardIcon = createIcon(CreditCardIconSvg)
export const Crown = createIcon(CrownSvg)
export const DollarSignIcon = createIcon(DollarSignSvg)
export const ExternalLinkIcon = createIcon(ExternalLinkSvg)
export const EyeIcon = createIcon(EyeIconSvg)
export const EyeOffIcon = createIcon(EyeOffIconSvg)
export const FileText = createIcon(FileTextSvg)
export const FilterIcon = createIcon(FilterIconSvg)
export const FolderKanbanIcon = createIcon(FolderKanbanIconSvg)
export const Github = createIcon(GithubSvg)
export const GlobeIcon = createIcon(GlobeIconSvg)
export const GripVerticalIcon = createIcon(GripVerticalSvg)
export const HardDriveIcon = createIcon(HardDriveIconSvg)
export const HardDriveUpload = createIcon(HardDriveUploadSvg)
export const HistoryIcon = createIcon(HistorySvg)
export const HomeIcon = createIcon(HomeIconSvg)
export const ImageIcon = createIcon(ImageIconSvg)
export const ImagePlusIcon = createIcon(ImagePlusSvg)
export const Images = createIcon(ImagesSvg)
export const ImagesIcon = createIcon(ImagesSvg)
export const Instagram = createIcon(InstagramSvg)
export const KeyIcon = createIcon(KeyIconSvg)
export const LayoutDashboardIcon = createIcon(LayoutDashboardSvg)
export const LifeBuoyIcon = createIcon(LifeBuoySvg)
export const Link2 = createIcon(Link2Svg)
export const Link2Icon = createIcon(Link2Svg)
export const Loader2 = createIcon(LoaderSvg)
export const Loader2Icon = createIcon(LoaderSvg)
export const LoaderCircleIcon = createIcon(LoaderCircleSvg)
export const Lock = createIcon(LockSvg)
export const LockIcon = createIcon(LockIconSvg)
export const LogOutIcon = createIcon(LogOutSvg)
export const Mail = createIcon(MailSvg)
export const MailCheckIcon = createIcon(MailCheckSvg)
export const MailPlusIcon = createIcon(MailPlusSvg)
export const MegaphoneIcon = createIcon(MegaphoneIconSvg)
export const Menu = createIcon(MenuSvg)
export const MenuIcon = createIcon(MenuIconSvg)
export const MessageCircle = createIcon(MessageCircleSvg)
export const MessageSquareIcon = createIcon(MessageSquareSvg)
export const MinusIcon = createIcon(MinusSvg)
export const MoonIcon = createIcon(MoonIconSvg)
export const MoreHorizontal = createIcon(MoreHorizontalSvg)
export const MoreHorizontalIcon = createIcon(MoreHorizontalIconSvg)
export const PackageIcon = createIcon(PackageIconSvg)
export const PanelLeftIcon = createIcon(PanelLeftIconSvg)
export const Play = createIcon(PlaySvg)
export const PlusIcon = createIcon(PlusSvg)
export const RefreshCcwIcon = createIcon(RefreshCcwSvg)
export const RefreshCwIcon = createIcon(RefreshCwSvg)
export const SaveIcon = createIcon(SaveIconSvg)
export const Scale = createIcon(ScaleSvg)
export const ScanSearchIcon = createIcon(ScanSearchSvg)
export const SearchIcon = createIcon(SearchIconSvg)
export const SendIcon = createIcon(SendSvg)
export const ServerCogIcon = createIcon(CloudIconSvg)
export const Settings2Icon = createIcon(Settings2Svg)
export const SettingsIcon = createIcon(SettingsIconSvg)
export const ShieldAlert = createIcon(ShieldAlertSvg)
export const ShieldAlertIcon = createIcon(ShieldAlertSvg)
export const ShieldCheck = createIcon(ShieldCheckSvg)
export const ShieldCheckIcon = createIcon(ShieldCheckSvg)
export const ShieldIcon = createIcon(ShieldIconSvg)
export const ShieldOffIcon = createIcon(ShieldOffSvg)
export const Smartphone = createIcon(SmartphoneSvg)
export const SmartphoneIcon = createIcon(SmartphoneSvg)
export const Sparkles = createIcon(SparklesSvg)
export const SparklesIcon = createIcon(SparklesIconSvg)
export const SunIcon = createIcon(SunIconSvg)
export const TicketIcon = createIcon(TicketIconSvg)
export const Trash2 = createIcon(Trash2Svg)
export const Trash2Icon = createIcon(Trash2Svg)
export const TriangleAlertIcon = createIcon(AlertTriangleSvg)
export const Twitter = createIcon(TwitterSvg)
export const UploadCloudIcon = createIcon(CloudUploadIconSvg)
export const UserCheckIcon = createIcon(UserCheckIconSvg)
export const UserCogIcon = createIcon(UserCogSvg)
export const UserPlusIcon = createIcon(UserPlusSvg)
export const UserRoundIcon = createIcon(UserRoundSvg)
export const UsersIcon = createIcon(UsersSvg)
export const WorkflowIcon = createIcon(WorkflowSvg)
export const X = createIcon(XSvg)
export const XCircleIcon = createIcon(XCircleSvg)
export const XIcon = createIcon(XSvg)
