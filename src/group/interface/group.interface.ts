export interface MemberType {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: Date;
}

export interface GroupType {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  admin_id: string;
  created_by_id: string;
}

export interface GroupMemberShipType {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: Date;
  user: {
    username: string;
  };
}

export interface GroupWithMemberShipType {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  admin_id: string;
  created_by_id: string;
  group_membership: GroupMemberShipType[];
}
