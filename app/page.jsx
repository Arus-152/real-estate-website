"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, Check, X, ChevronDown } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property-card"
import { LoginForm } from "@/components/login-form"
import { UserProfile } from "@/components/user-profile"
import { Pagination } from "@/components/pagination"
import { useAuth } from "@/context/auth-context"
import { getProperties, getViewHistory, getFavorites, removeFromViewHistory, checkFavorites } from "@/lib/api"

// Number of properties per page
const ITEMS_PER_PAGE = 4

export default function Home() {
  const { user, loading } = useAuth()

  // State for managing the current view
  const [currentView, setCurrentView] = useState("main")

  // State for properties data
  const [properties, setProperties] = useState([])
  const [viewedProperties, setViewedProperties] = useState([])
  const [favoritedProperties, setFavoritedProperties] = useState([])
  const [favoritedMap, setFavoritedMap] = useState({})
  const [dataLoading, setDataLoading] = useState(true)

  // State for managing the remove confirmation dialog
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [propertyToRemove, setPropertyToRemove] = useState(null)

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const totalViewHistoryPages = Math.ceil(viewedProperties.length / ITEMS_PER_PAGE)
  const totalFavoritesPages = Math.ceil(favoritedProperties.length / ITEMS_PER_PAGE)

  // State for auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Load data when user changes
  useEffect(() => {
    if (loading) return

    const loadData = async () => {
      setDataLoading(true)
      try {
        // Load all properties
        const allProps = await getProperties()
        setProperties(allProps)

        if (user) {
          // Load user's view history
          const history = await getViewHistory(user.id)
          setViewedProperties(history)

          // Load user's favorites
          const favs = await getFavorites(user.id)
          setFavoritedProperties(favs)

          // Check which properties are favorited
          const propertyIds = allProps.map((p) => p.id)
          const favsMap = await checkFavorites(user.id, propertyIds)
          setFavoritedMap(favsMap)

          // Add dummy data if needed - use setTimeout to avoid state update issues
          setTimeout(addDummyData, 500)
        } else {
          setViewedProperties([])
          setFavoritedProperties([])
          setFavoritedMap({})
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [user, loading])

  // Reset to page 1 when switching views
  useEffect(() => {
    setCurrentPage(1)
  }, [currentView])

  // Get current properties for the current page
  const getCurrentViewedProperties = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return viewedProperties.slice(startIndex, endIndex)
  }

  const getCurrentFavoritedProperties = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return favoritedProperties.slice(startIndex, endIndex)
  }

  // Function to handle property removal
  const handleRemoveProperty = (propertyId) => {
    setPropertyToRemove(propertyId)
    setRemoveDialogOpen(true)
  }

  // Function to confirm property removal
  const confirmRemoveProperty = async () => {
    if (!propertyToRemove || !user) return

    try {
      const result = await removeFromViewHistory(user.id, propertyToRemove)
      if (result.success) {
        setViewedProperties(viewedProperties.filter((p) => p.id !== propertyToRemove))

        // Adjust current page if necessary after removal
        const newTotalPages = Math.ceil((viewedProperties.length - 1) / ITEMS_PER_PAGE)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
      }
    } catch (error) {
      console.error("Error removing property:", error)
    } finally {
      setRemoveDialogOpen(false)
      setPropertyToRemove(null)
    }
  }

  // Modify the navigateToPropertyDetails function to prevent clearing the view history list
  // Replace the current navigateToPropertyDetails function with this one:

  const navigateToPropertyDetails = async (propertyId) => {
    // In a real app, this would navigate to the property details page
    console.log(`Navigating to property ${propertyId} details`)

    // Add to view history if user is logged in, but don't clear existing data
    if (user) {
      try {
        // Instead of replacing the view history, we'll just add to it if needed
        const propertyExists = viewedProperties.some((p) => p.id === propertyId)

        if (!propertyExists) {
          // Only add if it doesn't exist already
          const property = properties.find((p) => p.id === propertyId)
          if (property) {
            const propertyWithTimestamp = {
              ...property,
              viewed_at: new Date().toISOString(),
            }
            setViewedProperties([propertyWithTimestamp, ...viewedProperties])
          }
        } else {
          // If it exists, update the timestamp by moving it to the top
          const updatedViewHistory = [
            {
              ...viewedProperties.find((p) => p.id === propertyId),
              viewed_at: new Date().toISOString(),
            },
            ...viewedProperties.filter((p) => p.id !== propertyId),
          ]
          setViewedProperties(updatedViewHistory)
        }

        // No need to call the API which might clear our data
        // await addToViewHistory(user.id, propertyId);
        // const history = await getViewHistory(user.id);
        // setViewedProperties(history);
      } catch (error) {
        console.error("Error updating view history:", error)
      }
    }

    // In a real app, we would navigate to details page here
    // For now, we'll just stay on the current view
  }

  // Function to handle pagination
  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      ((currentView === "viewHistory" && newPage <= totalViewHistoryPages) ||
        (currentView === "favorites" && newPage <= totalFavoritesPages))
    ) {
      setCurrentPage(newPage)
    }
  }

  // Function to switch between View History and Favorites
  const switchView = (view) => {
    setCurrentView(view)
    setCurrentPage(1) // Reset to page 1 when switching views
  }

  // Function to handle favorite toggle
  const handleToggleFavorite = (propertyId, isFavorited) => {
    // Update the favorited map
    setFavoritedMap({
      ...favoritedMap,
      [propertyId]: isFavorited,
    })

    if (isFavorited) {
      // If favorited, add to favorites list if not already there
      if (!favoritedProperties.some((p) => p.id === propertyId)) {
        const property = properties.find((p) => p.id === propertyId)
        if (property) {
          const propertyWithTimestamp = {
            ...property,
            favorited_at: new Date().toISOString(),
          }
          setFavoritedProperties([propertyWithTimestamp, ...favoritedProperties])
        }
      }
    } else {
      // If unfavorited, remove from favorites list
      setFavoritedProperties(favoritedProperties.filter((p) => p.id !== propertyId))
    }
  }

  // Function to add dummy data for testing
  const addDummyData = () => {
    if ((!user && !user?.isGuest) || !properties.length) return

    try {
      // If view history is empty, add dummy data (at least 12 properties for 3 pages)
      if (viewedProperties.length === 0) {
        // Get 12-15 properties for view history (first 12-15 properties)
        const viewHistoryCount = Math.min(properties.length, 15)
        const dummyViewHistory = properties.slice(0, viewHistoryCount).map((property, index) => ({
          ...property,
          viewed_at: new Date(Date.now() - index * 3600000).toISOString(), // Stagger times by 1 hour
        }))
        setViewedProperties(dummyViewHistory)
      }

      // If favorites is empty, add dummy data (at least 12 properties for 3 pages)
      if (favoritedProperties.length === 0) {
        // Get different properties for favorites (next 12-15 properties or wrap around)
        const favoritesStartIndex = 5 // Start from a different position
        const favoritesCount = Math.min(properties.length - favoritesStartIndex, 15)

        let dummyFavorites = []
        if (favoritesCount >= 12) {
          // If we have enough properties left, use them
          dummyFavorites = properties.slice(favoritesStartIndex, favoritesStartIndex + favoritesCount)
        } else {
          // Otherwise, take some from the beginning to ensure we have at least 12
          const remainingNeeded = 12 - favoritesCount
          dummyFavorites = [...properties.slice(favoritesStartIndex), ...properties.slice(0, remainingNeeded)]
        }

        // Add timestamps and set favorites
        dummyFavorites = dummyFavorites.map((property, index) => ({
          ...property,
          favorited_at: new Date(Date.now() - index * 7200000).toISOString(), // Stagger times by 2 hours
        }))

        setFavoritedProperties(dummyFavorites)

        // Update favorited map
        const newFavoritedMap = { ...favoritedMap }
        dummyFavorites.forEach((property) => {
          newFavoritedMap[property.id] = true
        })
        setFavoritedMap(newFavoritedMap)
      }
    } catch (error) {
      console.error("Error adding dummy data:", error)
    }
  }

  // Render the main view with both options
  const renderMainView = () => (
    <section className="bg-[#e6f0ff] py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-black text-center mb-10">VIEW HISTORY AND FAVORITES</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* View History Card */}
          <div className="bg-white rounded-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#0041d9] rounded-lg flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="2" />
                <path d="M8 9H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 13H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 17H12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">View History List</h3>
            <p className="text-gray-600 mb-6">
              Easily revisit the properties you've explored. Keep track of your recently viewed listings and never lose
              sight of a potential dream home.
            </p>
            <Button
              className="bg-[#0041d9] hover:bg-[#0033a0] text-white px-6"
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true)
                } else {
                  setCurrentView("viewHistory")
                }
              }}
            >
              View History
            </Button>
          </div>

          {/* Favorites Card */}
          <div className="bg-white rounded-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#ea5a47] rounded-lg flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="white"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Favorites List</h3>
            <p className="text-gray-600 mb-6">
              Keep track of properties you love by adding them to your favorites. Quickly revisit your top choices and
              never miss out on a dream home!
            </p>
            <Button
              className="bg-[#ea5a47] hover:bg-[#d04a39] text-white px-6"
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true)
                } else {
                  setCurrentView("favorites")
                }
              }}
            >
              View Favorites
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">About Commerce Plaza</h3>
          <p className="text-gray-700">
            Recommendations are based on your location and search activity, such as the homes you've viewed and saved
            and the filters you've used. We use this information to bring similar homes to your attention, so you don't
            miss out.
          </p>
        </div>
      </div>
    </section>
  )

  // Render the empty view history state
  const renderEmptyViewHistory = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 mb-6">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 16.5C21 17.3284 20.3284 18 19.5 18H4.5C3.67157 18 3 17.3284 3 16.5V7.5C3 6.67157 3.67157 6 4.5 6H19.5C20.3284 6 21 6.67157 21 7.5V16.5Z"
            stroke="#333"
            strokeWidth="2"
          />
          <path d="M3 9L21 9" stroke="#333" strokeWidth="2" />
          <path d="M7 14H17" stroke="#333" strokeWidth="2" />
          <path d="M7 11H13" stroke="#333" strokeWidth="2" />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">You haven't viewed any properties yet.</h3>
      <p className="text-gray-600 mb-6 text-center">Start exploring to see your recently viewed history list here!</p>
      <Button className="bg-[#0041d9] hover:bg-[#0033a0] text-white px-6 mb-6" onClick={() => setCurrentView("main")}>
        Explore Properties!
      </Button>

      {/* Back Button */}
      <button
        className="flex items-center space-x-2 text-[#0041d9] font-medium border border-[#0041d9] rounded-full px-6 py-2"
        onClick={() => setCurrentView("main")}
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
    </div>
  )

  // Render the view history list
  const renderViewHistoryList = () => (
    <section className="bg-[#e6f0ff] py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-5xl font-bold text-black">VIEW HISTORY LIST</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full px-6 py-2 flex items-center space-x-2 bg-white">
                <span>View History List</span>
                <ChevronDown className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchView("viewHistory")}>
                <div className="flex items-center justify-between w-full">
                  <span>View History List</span>
                  <Check className="w-4 h-4 text-[#0041d9]" />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchView("favorites")}>
                <span>Favorites List</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {viewedProperties.length === 0 ? (
          renderEmptyViewHistory()
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getCurrentViewedProperties().map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorited={favoritedMap[property.id]}
                  onToggleFavorite={handleToggleFavorite}
                  onRemove={handleRemoveProperty}
                  onViewDetails={navigateToPropertyDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalViewHistoryPages} onPageChange={handlePageChange} />

            {/* Back Button */}
            <div className="mt-8">
              <button
                className="flex items-center space-x-2 text-[#0041d9] font-medium border border-[#0041d9] rounded-full px-6 py-2"
                onClick={() => setCurrentView("main")}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
          </>
        )}

        <div className="mt-12 text-center max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">About Commerce Plaza</h3>
          <p className="text-gray-700">
            Recommendations are based on your location and search activity, such as the homes you've viewed and saved
            and the filters you've used. We use this information to bring similar homes to your attention, so you don't
            miss out.
          </p>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl font-bold">REMOVE VIEW HISTORY</DialogTitle>
          <DialogDescription className="text-base">
            Are you sure you want to remove this property from your view history list?
          </DialogDescription>
          <div className="flex justify-center space-x-4 mt-6">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 px-6"
              onClick={confirmRemoveProperty}
            >
              <Check className="w-5 h-5" />
              <span>Remove</span>
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 flex items-center space-x-2 px-6"
              onClick={() => setRemoveDialogOpen(false)}
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )

  // Render the favorites list
  const renderFavoritesList = () => (
    <section className="bg-[#e6f0ff] py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-5xl font-bold text-black">FAVORITES LIST</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full px-6 py-2 flex items-center space-x-2 bg-white">
                <span>Favorites List</span>
                <ChevronDown className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchView("viewHistory")}>
                <span>View History List</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchView("favorites")}>
                <div className="flex items-center justify-between w-full">
                  <span>Favorites List</span>
                  <Check className="w-4 h-4 text-[#0041d9]" />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {favoritedProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 mb-6 text-[#ea5a47]">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="#ea5a47"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">You don't have any favorite properties yet.</h3>
            <p className="text-gray-600 mb-6 text-center">
              Start adding properties to your favorites by clicking the heart icon!
            </p>
            <Button
              className="bg-[#ea5a47] hover:bg-[#d04a39] text-white px-6 mb-6"
              onClick={() => setCurrentView("main")}
            >
              Explore Properties!
            </Button>

            {/* Back Button */}
            <button
              className="flex items-center space-x-2 text-[#0041d9] font-medium border border-[#0041d9] rounded-full px-6 py-2"
              onClick={() => setCurrentView("main")}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getCurrentFavoritedProperties().map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorited={true}
                  onToggleFavorite={handleToggleFavorite}
                  onViewDetails={navigateToPropertyDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalFavoritesPages} onPageChange={handlePageChange} />

            {/* Back Button */}
            <div className="mt-8">
              <button
                className="flex items-center space-x-2 text-[#0041d9] font-medium border border-[#0041d9] rounded-full px-6 py-2"
                onClick={() => setCurrentView("main")}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
          </>
        )}

        <div className="mt-12 text-center max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">About Commerce Plaza</h3>
          <p className="text-gray-700">
            Recommendations are based on your location and search activity, such as the homes you've viewed and saved
            and the filters you've used. We use this information to bring similar homes to your attention, so you don't
            miss out.
          </p>
        </div>
      </div>
    </section>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <nav className="flex items-center space-x-8">
          <Link href="#" className="font-bold text-black">
            HOMEPAGE
          </Link>
          <Link href="#" className="font-bold text-black">
            BUY
          </Link>
          <Link href="#" className="font-bold text-black">
            SELL
          </Link>
        </nav>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Image src="/logo.svg" alt="Commerce Plaza" width={150} height={60} className="h-14 w-auto" />
        </div>

        <div className="flex items-center space-x-6">
          <Link href="#" className="font-bold text-black">
            HELP
          </Link>
          {user ? (
            <UserProfile />
          ) : (
            <Button variant="ghost" className="flex items-center space-x-2" onClick={() => setAuthModalOpen(true)}>
              <div className="bg-[#f7f7f7] rounded-full p-2">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <span className="text-black font-medium">Sign In</span>
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px]">
        <Image src="/placeholder.svg?height=400&width=1200" alt="House" fill className="object-cover" />
        <div className="absolute inset-0 flex flex-col justify-center px-24">
          <h1 className="text-white text-7xl font-bold leading-tight max-w-md">FIND YOUR NEW HOME</h1>
          <div className="mt-8 max-w-2xl">
            <input
              type="text"
              placeholder="Enter an address, neighborhood, city, or ZIP code"
              className="w-full px-4 py-4 rounded-md text-black"
            />
          </div>
        </div>
      </section>

      {/* Main Content - Conditionally render based on current view */}
      {currentView === "main" && renderMainView()}
      {currentView === "viewHistory" && renderViewHistoryList()}
      {currentView === "favorites" && renderFavoritesList()}

      {/* Auth Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <LoginForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}
