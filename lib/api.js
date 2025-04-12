
"use server"

export async function getUser() {
  const cookieStore = cookies()
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Get all properties
export async function getProperties() {

  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_images(*)
    `)
    .order("id")

  if (error) {
    console.error("Error fetching properties:", error)
    return []
  }

  return data.map((property) => ({
    ...property,
    image: property.property_images[0]?.url || "/images/house1.jpg=300",
  }))
}

// Get user's view history
export async function getViewHistory(userId) {
  if (!userId) return []

  // For guest users, return empty array (dummy data will be added client-side)
  if (userId === "guest-user-id") {
    return []
  }

  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("view_history")
    .select(`
      *,
      properties(
        *,
        property_images(*)
      )
    `)
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })

  if (error) {
    console.error("Error fetching view history:", error)
    return []
  }

  return data.map((item) => ({
    ...item.properties,
    image: item.properties.property_images[0]?.url || "/placeholder.svg?height=200&width=300",
    viewed_at: item.viewed_at,
  }))
}

// Get user's favorites
export async function getFavorites(userId) {
  if (!userId) return []

  // For guest users, return empty array (dummy data will be added client-side)
  if (userId === "guest-user-id") {
    return []
  }

  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      *,
      properties(
        *,
        property_images(*)
      )
    `)
    .eq("user_id", userId)
    .order("favorited_at", { ascending: false })

  if (error) {
    console.error("Error fetching favorites:", error)
    return []
  }

  return data.map((item) => ({
    ...item.properties,
    image: item.properties.property_images[0]?.url || "/placeholder.svg?height=200&width=300",
    favorited_at: item.favorited_at,
  }))
}

// Add property to view history
export async function addToViewHistory(userId, propertyId) {
  if (!userId) return { success: false, message: "User not authenticated" }

  // For guest users, just return success (changes will be handled client-side)
  if (userId === "guest-user-id") {
    return { success: true }
  }

  const supabase = getSupabaseServer()

  // First check if it already exists
  const { data: existing } = await supabase
    .from("view_history")
    .select("*")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .single()

  if (existing) {
    // Update the timestamp
    const { error } = await supabase
      .from("view_history")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", existing.id)

    if (error) {
      console.error("Error updating view history:", error)
      return { success: false, message: error.message }
    }
  } else {
    // Insert new record
    const { error } = await supabase.from("view_history").insert({ user_id: userId, property_id: propertyId })

    if (error) {
      console.error("Error adding to view history:", error)
      return { success: false, message: error.message }
    }
  }

  return { success: true }
}

// Toggle favorite status
export async function toggleFavorite(userId, propertyId) {
  if (!userId) return { success: false, message: "User not authenticated" }

  // For guest users, just return success (changes will be handled client-side)
  if (userId === "guest-user-id") {
    return { success: true, favorited: true }
  }

  const supabase = getSupabaseServer()

  // Check if it's already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id)

    if (error) {
      console.error("Error removing favorite:", error)
      return { success: false, message: error.message }
    }

    return { success: true, favorited: false }
  } else {
    // Add to favorites
    const { error } = await supabase.from("favorites").insert({ user_id: userId, property_id: propertyId })

    if (error) {
      console.error("Error adding favorite:", error)
      return { success: false, message: error.message }
    }

    return { success: true, favorited: true }
  }
}

// Remove from view history
export async function removeFromViewHistory(userId, propertyId) {
  if (!userId) return { success: false, message: "User not authenticated" }

  // For guest users, just return success (changes will be handled client-side)
  if (userId === "guest-user-id") {
    return { success: true }
  }

  const supabase = getSupabaseServer()

  const { error } = await supabase.from("view_history").delete().eq("user_id", userId).eq("property_id", propertyId)

  if (error) {
    console.error("Error removing from view history:", error)
    return { success: false, message: error.message }
  }

  return { success: true }
}

// Check if properties are favorited
export async function checkFavorites(userId, propertyIds) {
  if (!userId || !propertyIds.length) return {}

  // For guest users, return empty object (favorites will be handled client-side)
  if (userId === "guest-user-id") {
    return {}
  }

  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("favorites")
    .select("property_id")
    .eq("user_id", userId)
    .in("property_id", propertyIds)

  if (error) {
    console.error("Error checking favorites:", error)
    return {}
  }

  const favoritedMap = {}
  data.forEach((item) => {
    favoritedMap[item.property_id] = true
  })

  return favoritedMap
}
