"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

// Helper to verify admin credentials from the client-provided access token
async function verifyAdmin(token: string) {
    if (!token) {
        throw new Error("Unauthorized: Missing session token.");
    }
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
        throw new Error("Unauthorized: Invalid session.");
    }
    return user;
}

// Zod schemas for input validation
const eventSchema = z.object({
    title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
    date: z.string().trim().min(1, "Date is required"),
    time: z.string().trim().min(1, "Time is required"),
    location: z.string().trim().min(1, "Location is required"),
    description: z.string().trim().min(1, "Description is required"),
    type: z.enum(["Workshop", "Hackathon", "Talk", "Meetup"]),
    attendees: z.string().trim().max(50),
    status: z.enum(["Upcoming", "Registration Open", "Completed"]),
    poster_url: z.string().trim().max(500),
    link: z.string().trim().max(500),
});

const teamSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    role: z.string().trim().min(1, "Role is required").max(100),
    is_core_team: z.boolean(),
    is_faculty_advisor: z.boolean(),
    image_url: z.string().trim().max(500).nullable(),
    display_order: z.number().int(),
});

const financeSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    type: z.enum(["Yearly", "Event"]),
    income: z.number().nonnegative(),
    expenses: z.number().nonnegative(),
    balance: z.number(),
    income_details: z.array(z.object({ item: z.string().trim(), amount: z.number() })).nullable(),
    expense_details: z.array(z.object({ item: z.string().trim(), amount: z.number() })).nullable(),
    date: z.string().trim().min(1, "Date is required"),
    report_url: z.string().trim().max(500).nullable(),
});

// Event Mutations
export async function saveEvent(token: string, eventData: Record<string, unknown>, id?: string | null) {
    await verifyAdmin(token);
    const parsed = eventSchema.parse(eventData);

    if (id) {
        const { error } = await supabaseAdmin
            .from("events")
            .update(parsed)
            .eq("id", id);
        if (error) throw new Error(error.message);
    } else {
        const { error } = await supabaseAdmin
            .from("events")
            .insert([parsed]);
        if (error) throw new Error(error.message);
    }
    return { success: true };
}

export async function deleteEvent(token: string, id: string) {
    await verifyAdmin(token);
    const { error } = await supabaseAdmin
        .from("events")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// Team Mutations
export async function saveTeamMember(token: string, memberData: Record<string, unknown>, id?: string | null) {
    await verifyAdmin(token);
    const parsed = teamSchema.parse(memberData);

    if (id) {
        const { error } = await supabaseAdmin
            .from("team_members")
            .update(parsed)
            .eq("id", id);
        if (error) throw new Error(error.message);
    } else {
        const { error } = await supabaseAdmin
            .from("team_members")
            .insert([parsed]);
        if (error) throw new Error(error.message);
    }
    return { success: true };
}

export async function deleteTeamMember(token: string, id: string) {
    await verifyAdmin(token);
    const { error } = await supabaseAdmin
        .from("team_members")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// Finance Mutations
export async function saveFinanceReport(token: string, reportData: Record<string, unknown>, id?: string | null) {
    await verifyAdmin(token);
    const parsed = financeSchema.parse(reportData);

    const payload = {
        ...parsed,
        updated_at: new Date().toISOString()
    };

    if (id) {
        const { error } = await supabaseAdmin
            .from("financial_reports")
            .update(payload)
            .eq("id", id);
        if (error) throw new Error(error.message);
    } else {
        const { error } = await supabaseAdmin
            .from("financial_reports")
            .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw new Error(error.message);
    }
    return { success: true };
}

export async function deleteFinanceReport(token: string, id: string) {
    await verifyAdmin(token);
    const { error } = await supabaseAdmin
        .from("financial_reports")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// Site Content Mutations
export async function saveSiteContent(token: string, sectionKey: string, contentFields: Record<string, unknown>) {
    await verifyAdmin(token);
    if (!sectionKey) throw new Error("Section key is required.");

    const { data: existing } = await supabaseAdmin
        .from("site_content")
        .select("id")
        .eq("section", sectionKey)
        .single();

    if (existing) {
        const { error } = await supabaseAdmin
            .from("site_content")
            .update({ content: contentFields })
            .eq("section", sectionKey);
        if (error) throw new Error(error.message);
    } else {
        const { error } = await supabaseAdmin
            .from("site_content")
            .insert({ section: sectionKey, content: contentFields });
        if (error) throw new Error(error.message);
    }
    return { success: true };
}

// Storage File Mutations
export async function uploadStorageFile(token: string, bucket: string, fileName: string, formData: FormData) {
    await verifyAdmin(token);
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    // Validate MIME types
    const validMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "application/pdf"
    ];
    if (!validMimes.includes(file.type)) {
        throw new Error("Invalid file type. Only JPEG, PNG, GIF, WEBP, SVG, and PDF are allowed.");
    }

    // Validate file sizes (5MB for gallery, 2MB for others)
    const maxSize = bucket === "event-photos" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
    }

    // Sanitize filename to prevent directory traversal and special character issues
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf"].includes(ext)) {
        throw new Error("Invalid file extension.");
    }
    const safeBase = fileName
        .substring(0, fileName.lastIndexOf("."))
        .replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeName = `${safeBase}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(safeName, buffer, {
            contentType: file.type,
            upsert: true
        });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return { url: urlData.publicUrl, path: data.path, fileName: safeName };
}

export async function deleteStorageFile(token: string, bucket: string, path: string) {
    await verifyAdmin(token);
    if (!bucket || !path) throw new Error("Bucket and path are required.");

    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);

    if (error) throw new Error(error.message);
    return { success: true };
}
