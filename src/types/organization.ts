export type Organizations = Organization[]

export interface Organization {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  slug?: string
  members: Member[]
  features: string[]
}

export interface Member {
  sanityUserId: string
  isCurrentUser: boolean
  user: User
  roles: Role[]
}

export interface User {
  id: string
  displayName: string
  familyName: string
  givenName: string
  middleName: any
  imageUrl?: string
  email: string
  loginProvider: string
}

export interface Role {
  name: string
  title: string
  description: string
}
