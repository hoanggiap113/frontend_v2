import { ChannelsPageView } from '../components/ChannelsPageView'
import { useChannelsPage } from '../hooks/useChannelsPage'

export default function ChannelsPage() {
  const viewProps = useChannelsPage()
  return <ChannelsPageView {...viewProps} />
}
