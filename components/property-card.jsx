"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MoreHorizontal, MapPin, Bed, Bath, Square } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

export function PropertyCard({ property, isFavorited, onToggleFavorite, onRemove, onViewDetails }) {
  const { user } = useAuth()
  const [favorited, setFavorited] = useState(isFavorited)

  const handleToggleFavorite = () => {
    if (!user) return

    // Update local state immediately
    const newFavoritedState = !favorited
    setFavorited(newFavoritedState)

    // Notify parent component about the change
    if (onToggleFavorite) {
      onToggleFavorite(property.id, newFavoritedState)
    }
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 cursor-pointer" onClick={() => onViewDetails(property.id)}>
        <Image
          src={property.image || "/placeholder.svg?height=200&width=300"}
          alt={property.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleFavorite()
            }}
            className="bg-white p-1.5 rounded-full shadow-md"
            disabled={!user}
          >
            <Heart className={`w-5 h-5 ${favorited ? "text-[#ea5a47] fill-[#ea5a47]" : "text-gray-400"}`} />
          </button>
        </div>
        {property.active && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold text-black">{formatCurrency(property.price)}</div>
            <h3 className="font-medium text-gray-800 mt-1 line-clamp-1">{property.title}</h3>
          </div>
          {onRemove && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(property.id)}>View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRemove(property.id)}>Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-600 mt-2">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            <span>{property.beds || "--"}</span>
          </div>
          <span className="mx-2">|</span>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span>{property.baths || "--"}</span>
          </div>
          <span className="mx-2">|</span>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            <span className="font-medium">{property.sqft || "--"}</span>
          </div>
        </div>

        <div className="mt-2 text-sm flex items-start">
          <MapPin className="w-4 h-4 text-gray-500 mr-1 mt-0.5 flex-shrink-0" />
          <div className="text-gray-700 line-clamp-1">{property.location}</div>
        </div>

        <div className="text-gray-500 text-xs mt-2 flex justify-between">
          <span>{property.agent}</span>
          {property.mls_id && <span>MLS# {property.mls_id}</span>}
        </div>
      </div>
    </div>
  )
}
