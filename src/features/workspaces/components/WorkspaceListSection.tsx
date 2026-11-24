import { Button, Col, Flex, Row, Tag, Typography } from 'antd'
import { ArrowRight, Building2, Plus } from '#/components/ui/icons'
import type { TenantResponse } from '#/lib/types/workspace'

interface WorkspaceListSectionProps {
  onSelectWorkspace: (workspace: TenantResponse) => void
  onCreateWorkspace: () => void
  workspaces: TenantResponse[]
  recentWorkspaceId: string | null
  showCreateTile: boolean
}

export function WorkspaceListSection({
  onSelectWorkspace,
  onCreateWorkspace,
  workspaces,
  recentWorkspaceId,
  showCreateTile,
}: WorkspaceListSectionProps) {
  return (
    <Row gutter={[16, 16]} className="workspace-picker__grid">
      {workspaces.map((workspace) => (
        <Col key={workspace.id} xs={24} sm={12}>
          <Button
            block
            className="workspace-picker__tile"
            onClick={() => onSelectWorkspace(workspace)}
          >
            <span className="workspace-picker__tile-icon">
              <Building2 size={24} aria-hidden="true" />
            </span>
            <Flex vertical gap={4} className="min-w-0 flex-1 text-left">
              <Flex align="center" gap={8} className="min-w-0">
                <Typography.Text ellipsis strong>{workspace.name}</Typography.Text>
                {workspace.myRole ? (
                  <Tag className="workspace-picker__role" color={workspace.myRole === 'MEMBER' ? 'default' : 'blue'}>
                    {workspace.myRole === 'MEMBER' ? 'Thành viên' : 'Quản trị viên'}
                  </Tag>
                ) : null}
              </Flex>
              <Typography.Text ellipsis type="secondary" className="text-xs">
                /{workspace.slug}
              </Typography.Text>
              {workspace.channelsCount !== undefined || workspace.unreadMessagesCount !== undefined ? (
                <Typography.Text type="secondary" className="workspace-picker__stats">
                  {workspace.channelsCount ?? 0} kênh kết nối
                  {workspace.unreadMessagesCount !== undefined ? ` · ${workspace.unreadMessagesCount} tin nhắn chưa đọc` : ''}
                </Typography.Text>
              ) : null}
              {recentWorkspaceId === workspace.id ? (
                <Typography.Text className="workspace-picker__recent">Truy cập gần nhất</Typography.Text>
              ) : null}
            </Flex>
            <ArrowRight size={15} className="workspace-picker__arrow shrink-0" aria-hidden="true" />
          </Button>
        </Col>
      ))}
      {showCreateTile ? (
        <Col xs={24} sm={12}>
        <Button
          type="default"
          block
          className="workspace-picker__create-tile"
          onClick={onCreateWorkspace}
        >
          <Plus size={18} aria-hidden="true" />
          <span>Tạo không gian làm việc mới</span>
        </Button>
        </Col>
      ) : null}
    </Row>
  )
}
