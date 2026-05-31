"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Upload, KeyRound, Menu } from "lucide-react";
import { useRef, useCallback, useState } from "react";
import { useStdb } from "@/providers/spacetimedb-provider";
import { SIGNATURE_KEY } from "@/lib/constants";
import { toast } from "sonner";

const BOSS_NAV = [
 { href: "/boss", label: "Dashboard" },
 { href: "/boss/employees", label: "Employees" },
 { href: "/boss/settings", label: "Settings" },
];

const EMPLOYEE_NAV = [
 { href: "/employee", label: "Dashboard" },
 { href: "/employee/profile", label: "Profile" },
 { href: "/employee/submit", label: "Submit Payslip" },
];

export function AppHeader() {
 const pathname = usePathname();
 const { isLoggedIn, role, user, logout } = useAuth();
 const { conn } = useStdb();
 const signatureInputRef = useRef<HTMLInputElement>(null);
 const [pwOpen, setPwOpen] = useState(false);
 const [oldPw, setOldPw] = useState("");
 const [newPw, setNewPw] = useState("");
 const [confirmPw, setConfirmPw] = useState("");

 const navItems =
 role === "boss" ? BOSS_NAV : role === "employee" ? EMPLOYEE_NAV : [];

 const handleSignatureUpload = useCallback(
 (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 const reader = new FileReader();
 reader.onload = () => {
 localStorage.setItem(SIGNATURE_KEY, reader.result as string);
 toast.success("Signature saved to this browser");
 };
 reader.readAsDataURL(file);
 e.target.value = "";
 },
 [],
 );

 function handleChangePassword() {
 if (!conn) return;
 if (newPw !== confirmPw) {
 toast.error("Passwords don't match");
 return;
 }
 if (newPw.length < 4) {
 toast.error("Password must be at least 4 characters");
 return;
 }
 try {
 conn.reducers.changePassword({ oldPassword: oldPw, newPassword: newPw });
 toast.success("Password changed");
 setPwOpen(false);
 setOldPw("");
 setNewPw("");
 setConfirmPw("");
 } catch (err: unknown) {
 toast.error(
 err instanceof Error ? err.message : "Failed to change password",
 );
 }
 }

 const handleLogout = useCallback(() => {
 logout();
 window.location.href = "/";
 }, [logout]);

 return (
 <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
 <div className="container mx-auto flex h-12 items-center px-3">
 <Link
 href={
 role === "boss" ? "/boss" : role === "employee" ? "/employee" : "/"
 }
 className="text-base font-semibold shrink-0"
 >
 Payslip Generator
 </Link>

 {isLoggedIn && (
 <>
 {/* Desktop Nav */}
 <nav className="hidden md:flex items-center gap-1 ml-4">
 {navItems.map((item) => (
 <Button
 key={item.href}
 variant="ghost"
 size="sm"
 asChild
 className={cn(
 pathname === item.href &&
 "bg-accent text-accent-foreground",
 )}
 >
 <Link href={item.href}>{item.label}</Link>
 </Button>
 ))}
 </nav>

 <div className="flex-1" />

 {/* Desktop Actions */}
 <div className="hidden md:flex items-center gap-1">
 {role === "boss" && (
 <>
 <input
 ref={signatureInputRef}
 type="file"
 accept="image/*"
 className="hidden"
 onChange={handleSignatureUpload}
 />
 <Button
 variant="ghost"
 size="sm"
 onClick={() => signatureInputRef.current?.click()}
 >
 <Upload className="mr-1 size-4" />
 Signature
 </Button>
 </>
 )}

 <Dialog
 open={pwOpen}
 onOpenChange={(open) => {
 setPwOpen(open);
 if (!open) {
 setOldPw("");
 setNewPw("");
 setConfirmPw("");
 }
 }}
 >
 <DialogTrigger asChild>
 <Button variant="ghost" size="sm">
 <KeyRound className="mr-1 size-4" />
 Password
 </Button>
 </DialogTrigger>
 <DialogContent className="sm:max-w-sm">
 <DialogHeader>
 <DialogTitle>Change Password</DialogTitle>
 </DialogHeader>
 <div className="space-y-3">
 <div>
 <Label htmlFor="oldPw">Current Password</Label>
 <Input
 id="oldPw"
 type="password"
 value={oldPw}
 onChange={(e) => setOldPw(e.target.value)}
 className="mt-1"
 />
 </div>
 <div>
 <Label htmlFor="newPw">New Password</Label>
 <Input
 id="newPw"
 type="password"
 value={newPw}
 onChange={(e) => setNewPw(e.target.value)}
 className="mt-1"
 />
 </div>
 <div>
 <Label htmlFor="confirmPw">Confirm New Password</Label>
 <Input
 id="confirmPw"
 type="password"
 value={confirmPw}
 onChange={(e) => setConfirmPw(e.target.value)}
 className="mt-1"
 />
 </div>
 <Button className="w-full" onClick={handleChangePassword}>
 Change Password
 </Button>
 </div>
 </DialogContent>
 </Dialog>

 <span className="text-sm text-muted-foreground mx-2">
 {user?.name}
 </span>

 <Button variant="ghost" size="sm" onClick={handleLogout}>
 <LogOut className="mr-1 size-4" />
 Logout
 </Button>
 </div>

 {/* Mobile Menu */}
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="md:hidden">
 <Menu className="size-5" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-48">
 {navItems.map((item) => (
 <DropdownMenuItem key={item.href} asChild>
 <Link href={item.href}>{item.label}</Link>
 </DropdownMenuItem>
 ))}
 <DropdownMenuSeparator />
 {role === "boss" && (
 <>
 <DropdownMenuItem
 onClick={() => signatureInputRef.current?.click()}
 >
 <Upload className="mr-2 size-4" />
 Signature
 </DropdownMenuItem>
 <input
 ref={signatureInputRef}
 type="file"
 accept="image/*"
 className="hidden"
 onChange={handleSignatureUpload}
 />
 </>
 )}
 <DropdownMenuItem
 onClick={() => setPwOpen(true)}
 >
 <KeyRound className="mr-2 size-4" />
 Change Password
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
 <LogOut className="mr-2 size-4" />
 Logout
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </>
 )}
 </div>
 </header>
 );
}
