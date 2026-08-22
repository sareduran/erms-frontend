export type Role = 'Employee' | 'Manager' | 'Admin'
export type Status = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
export type Priority = 'Low' | 'Normal' | 'High'
export interface User { id:number; fullName:string; email:string; role:Role; department:string; managerId?:number|null; isActive:boolean; mustChangePassword:boolean }
export interface AuthResponse { accessToken:string; refreshToken:string; expiresAt:string; user:User }
export interface RequestType { id:number; name:string; requiresApproval:boolean; isActive:boolean }
export interface Department { id:number; name:string; isActive:boolean }
export interface RequestItem { id:number; title:string; type:string; status:Status; priority:Priority; requester:string; createdAt:string }
export interface Paged<T> { page:number; pageSize:number; totalCount:number; items:T[] }
export interface RequestDetail extends RequestItem { requestTypeId:number; requesterId:number; description:string; startDate?:string; endDate?:string; amount?:number; updatedAt:string; approvals:{id:number;decision:string;approver:string;comment?:string;decidedAt:string}[]; comments:{id:number;author:string;content:string;createdAt:string}[]; attachments:{id:number;fileName:string;contentType:string;fileSize:number;createdAt:string}[]; history:{id:number;requestId:number;oldStatus?:string;newStatus:string;action:string;changedBy:string;changedAt:string}[] }
export interface ApiErrorShape { code:string; message:string; errors?:Record<string,string[]>; retryAfterSeconds?:number }
export interface NotificationItem { id:number; requestId?:number; type:'Approval'|'Rejection'|'Comment'|string; title:string; message:string; isRead:boolean; createdAt:string }
export interface NotificationList { unreadCount:number; items:NotificationItem[] }
