"use client";

import { useState, useRef, useEffect, use } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImagePlus, X, Loader2, Trash2 } from "lucide-react";
import { listingsApi } from "@/lib/api/listings.api";
import { useAuthStore } from "@/store/auth.store";
import type { ListingDetail, ListingImage } from "@/types/listing.types";

// Definir el esquema y el tipo explícitamente
const schema = z.object({
  title: z.string().min(5, "At least 5 characters"),
  description: z.string().min(10, "At least 10 characters"),
  city: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  maxGuests: z.coerce.number().min(1, "At least 1 guest"),
  pricePerNight: z.coerce.number().positive("Must be positive"),
});

type FormValues = z.infer<typeof schema>;

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-xs mt-1.5 ml-1">{msg}</p> : null;
}

function FloatingInput({
  label,
  id,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
}) {
  return (
    <div>
      <div
        className={`relative border rounded-xl overflow-hidden transition-colors ${error ? "border-red-400" : "border-[#b0b0b0] focus-within:border-[#222]"}`}
      >
        <input
          id={id}
          placeholder=" "
          className="peer w-full px-4 pt-6 pb-2 text-sm text-[#222] bg-transparent outline-none"
          {...props}
        />
        <label
          htmlFor={id}
          className="absolute left-4 top-2 text-[11px] text-gray-500 peer-placeholder-shown:top-[50%] peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] transition-all pointer-events-none"
        >
          {label}
        </label>
      </div>
      <FieldError msg={error} />
    </div>
  );
}

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);
  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [serverError, setServerError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();
  const router = useRouter();

  // Tipado explícito con el tipo FormValues
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      title: "",
      description: "",
      city: "",
      country: "",
      maxGuests: 1,
      pricePerNight: 0,
    },
  });

  useEffect(() => {
    if (!token) return;
    listingsApi
      .getById(id)
      .then((data) => {
        setListing(data);
        setExistingImages(data.images ?? []);
        reset({
          title: data.title,
          description: data.description,
          city: data.city,
          country: data.country,
          maxGuests: data.maxGuests,
          pricePerNight: parseFloat(data.pricePerNight),
        });
      })
      .finally(() => setPageLoading(false));
  }, [id, token, reset]);

  const addNewFiles = (files: FileList | null) => {
    if (!files) return;
    const total = existingImages.length + newFiles.length;
    const slots = Math.max(0, 10 - total);
    const next = [...newFiles, ...Array.from(files)].slice(0, slots);
    setNewFiles(next);
    setNewPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeNewFile = (i: number) => {
    const next = newFiles.filter((_, idx) => idx !== i);
    setNewFiles(next);
    setNewPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleDeleteExisting = async (publicId: string) => {
    setDeletingPublicId(publicId);
    try {
      await listingsApi.deleteImage(id, publicId, token!);
      setExistingImages((prev) =>
        prev.filter((img) => img.public_id !== publicId),
      );
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to delete image",
      );
    } finally {
      setDeletingPublicId(null);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    try {
      await listingsApi.update(
        id,
        {
          title: data.title,
          description: data.description,
          city: data.city,
          country: data.country,
          maxGuests: data.maxGuests,
          pricePerNight: data.pricePerNight,
        },
        token!,
      );

      if (newFiles.length > 0) {
        await listingsApi.addImages(id, newFiles, token!);
      }

      router.push("/host/listings");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  if (pageLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff385c]" />
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center pt-20">
        <p className="text-gray-500">Listing not found.</p>
        <Link
          href="/host/listings"
          className="text-[#ff385c] font-semibold underline mt-4 inline-block"
        >
          Back to my listings
        </Link>
      </main>
    );
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/host/listings"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222] hover:underline mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        My listings
      </Link>

      <h1 className="text-2xl font-bold text-[#222] mb-1">Edit listing</h1>
      <p className="text-gray-500 text-sm mb-8">Update your property details</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Images */}
        <div>
          <p className="text-sm font-semibold text-[#222] mb-3">
            Photos{" "}
            <span className="text-gray-400 font-normal">
              ({totalImages}/10)
            </span>
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
            {/* Existing Cloudinary images */}
            {existingImages.map((img) => (
              <div
                key={img.public_id}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="144px"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(img.public_id)}
                  disabled={deletingPublicId === img.public_id}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-70"
                >
                  {deletingPublicId === img.public_id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}

            {/* New file previews */}
            {newPreviews.map((src, i) => (
              <div
                key={`new-${i}`}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add button */}
            {totalImages < 10 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[#ddd] hover:border-[#ff385c] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#ff385c] transition-colors"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,image/avif"
            multiple
            onChange={(e) => addNewFiles(e.target.files)}
            className="hidden"
          />
        </div>

        <FloatingInput
          label="Title"
          id="title"
          error={errors.title?.message}
          {...register("title")}
        />

        {/* Description */}
        <div>
          <div
            className={`relative border rounded-xl overflow-hidden transition-colors ${errors.description ? "border-red-400" : "border-[#b0b0b0] focus-within:border-[#222]"}`}
          >
            <textarea
              {...register("description")}
              id="description"
              placeholder=" "
              rows={4}
              className="peer w-full px-4 pt-6 pb-2 text-sm text-[#222] bg-transparent outline-none resize-none"
            />
            <label
              htmlFor="description"
              className="absolute left-4 top-2 text-[11px] text-gray-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] transition-all pointer-events-none"
            >
              Description
            </label>
          </div>
          <FieldError msg={errors.description?.message} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            label="City"
            id="city"
            error={errors.city?.message}
            {...register("city")}
          />
          <FloatingInput
            label="Country"
            id="country"
            error={errors.country?.message}
            {...register("country")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            label="Max guests"
            id="maxGuests"
            type="number"
            min={1}
            error={errors.maxGuests?.message}
            {...register("maxGuests")}
          />
          <FloatingInput
            label="Price per night ($)"
            id="pricePerNight"
            type="number"
            min={1}
            step="0.01"
            error={errors.pricePerNight?.message}
            {...register("pricePerNight")}
          />
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c10d4a] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </form>
    </main>
  );
}
