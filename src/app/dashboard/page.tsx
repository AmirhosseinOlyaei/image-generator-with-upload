"use client"

import ImageUpload from "@/components/dashboard/ImageUpload"
import ProviderKeyModal from "@/components/dashboard/ProviderKeyModal"
import SubscriptionModal from "@/components/dashboard/SubscriptionModal"
import Footer from "@/components/navigation/Footer"
import MainAppBar from "@/components/navigation/MainAppBar"
import { supabase } from "@/lib/supabase"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import SaveAltIcon from "@mui/icons-material/SaveAlt"
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Define UserProfile type properly
interface UserProfile {
  id: string
  email: string
  freeImageUsed: boolean
  subscription_tier: "free" | "pro" | "premium"
  custom_api_key?: string
  created_at?: string
  updated_at?: string
}

// AI providers
const aiProviders = [
  {
    id: "openai",
    name: "OpenAI DALL-E 3",
    description:
      "Advanced AI model by OpenAI with excellent Ghibli transformations",
  },
  {
    id: "stability",
    name: "Stability AI",
    description:
      "Specialized in artistic transformations with great Ghibli styles",
  },
  {
    id: "midjourney",
    name: "Midjourney (via API)",
    description: "Known for highest quality anime-style transformations",
  },
  {
    id: "leonardo",
    name: "Leonardo AI",
    description: "AI platform with fine-tuned Ghibli aesthetic capabilities",
  },
]

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  )
  const [selectedProvider, setSelectedProvider] = useState("openai")
  const [error, setError] = useState<string | null>(null)
  const [customApiKey, setCustomApiKey] = useState<string>("")

  // Modal states
  const [showProviderKeyModal, setShowProviderKeyModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  useEffect(() => {
    async function getUser() {
      try {
        // Get user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (profileError) {
            if (profileError.code === "PGRST116") {
              // Profile doesn't exist yet, create it
              const { data: newProfile, error: createError } = await supabase
                .from("profiles")
                .insert([
                  {
                    id: user.id,
                    email: user.email,
                    freeImageUsed: false,
                    subscription_tier: "free",
                  },
                ])
                .select("*")
                .single()

              if (!createError) {
                setProfile(newProfile as UserProfile)
              } else {
                setError(
                  "Error creating profile. Please try refreshing the page."
                )
              }
            } else {
              setError(
                "Error fetching profile. Please try refreshing the page."
              )
            }
          } else {
            setProfile(profileData as UserProfile)

            // If they have a custom API key stored, load it
            if (profileData?.custom_api_key) {
              setCustomApiKey(profileData.custom_api_key)
            }
          }
        }
      } catch (error) {
        setError("Authentication error. Please try signing in again.")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [loading, user, router])

  const handleFileUpload = (file: File) => {
    setUploadedImage(file)
    setUploadedImageUrl(URL.createObjectURL(file))
    setGeneratedImageUrl(null)
    setError(null)
  }

  const handleProviderChange = (event: SelectChangeEvent<string>) => {
    setSelectedProvider(event.target.value)
  }

  const handleCustomApiKeySubmit = async (providerKey: string) => {
    setCustomApiKey(providerKey)
    setShowProviderKeyModal(false)

    // Update the user's custom API key in the database
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ custom_api_key: providerKey })
        .eq("id", user.id)

      if (error) {
        setError("Failed to save your API key. Please try again.")
      }
    }
  }

  const ghibliPrompt = `Create a Studio Ghibli style artwork based on a selfie of a person in a restaurant or bar. 
Transform the subject into a Ghibli character with simplified, expressive features and slightly larger eyes. 
Render the image in Ghibli's signature watercolor aesthetic with soft, warm lighting. 
The background should feature enhanced versions of the colorful abstract artwork on the wall, made more dreamlike and 
fantastical with subtle magical elements like glowing dust particles. 
Include wooden beams and pendant lights from the original, but with the warm, 
nostalgic ambiance typical of Ghibli interiors. 
Use a palette of rich but soft colors with the characteristic Ghibli attention to texture and detail. 
The overall mood should be contemplative yet warm, capturing the essence of directors Hayao Miyazaki and Isao Takahata's artistic style.`

  const handleGenerateImage = async () => {
    if (!uploadedImage) {
      setError("Please upload an image first")
      return
    }

    if (!profile) {
      setError("Unable to fetch your profile information")
      return
    }

    // Check if user has already used their free image
    if (
      profile.freeImageUsed &&
      profile.subscription_tier === "free" &&
      !customApiKey
    ) {
      // Show options for user
      setError(
        "You've already used your free transformation. Please provide your API key or subscribe to a plan."
      )
      return
    }

    setGenerating(true)
    setError(null)

    try {
      // Create FormData for API call
      const formData = new window.FormData()
      formData.append("image", uploadedImage)
      formData.append("prompt", ghibliPrompt)
      formData.append("provider", selectedProvider)

      if (customApiKey) {
        formData.append("api_key", customApiKey)
      }

      // Actual API call to your backend endpoint
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      })

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
            `Error: ${response.status} - ${response.statusText}`
        )
      }

      const data = await response.json()

      if (!data.imageUrl) {
        throw new Error("No image URL received from the server")
      }

      setGeneratedImageUrl(data.imageUrl)

      // If this was their free image, mark it as used
      if (
        !profile.freeImageUsed &&
        profile.subscription_tier === "free" &&
        !customApiKey
      ) {
        const { error } = await supabase
          .from("profiles")
          .update({ freeImageUsed: true })
          .eq("id", user.id)

        if (error) {
          setError(
            "Failed to update your usage. Your transformation was successful, but you may see this free option again."
          )
        } else {
          // Update local state
          setProfile({ ...profile, freeImageUsed: true })
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to generate image. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadImage = () => {
    if (generatedImageUrl) {
      // For remote URLs, we need to handle CORS issues
      // A better approach is to use a server endpoint for downloading
      fetch(generatedImageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = "ghibli-transformation.jpg"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url) // Clean up
        })
        .catch(() => {
          setError("Failed to download image. Please try again.")
        })
    }
  }

  const handleShowOptions = () => {
    // Determine which modal to show
    if (profile?.freeImageUsed && profile?.subscription_tier === "free") {
      setShowProviderKeyModal(true)
    }
  }

  if (loading) {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainAppBar user={user} loading={false} />

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main", mb: 4 }}
        >
          Transform Your Image
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              profile?.freeImageUsed &&
              profile?.subscription_tier === "free" ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleShowOptions}
                >
                  See Options
                </Button>
              ) : undefined
            }
          >
            {error}
          </Alert>
        )}

        {profile?.freeImageUsed === false &&
          profile?.subscription_tier === "free" && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You have 1 free image transformation available! Enjoy your Ghibli
              experience.
            </Alert>
          )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Upload Your Image
              </Typography>

              <ImageUpload
                onFileSelected={handleFileUpload}
                imagePreview={uploadedImageUrl}
              />

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="provider-select-label">
                    AI Provider
                  </InputLabel>
                  <Select
                    labelId="provider-select-label"
                    id="provider-select"
                    value={selectedProvider}
                    label="AI Provider"
                    onChange={handleProviderChange}
                  >
                    {aiProviders.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id}>
                        <Box>
                          <Typography variant="body1">
                            {provider.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {provider.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleGenerateImage}
                  disabled={!uploadedImage || generating}
                  sx={{
                    py: 1.5,
                    position: "relative",
                  }}
                >
                  {generating ? (
                    <>
                      <CircularProgress
                        size={24}
                        color="inherit"
                        sx={{ position: "absolute" }}
                      />
                      <span style={{ opacity: 0 }}>Generate Ghibli Image</span>
                    </>
                  ) : (
                    "Generate Ghibli Image"
                  )}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Result
              </Typography>

              {generatedImageUrl ? (
                <Box
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  <Box
                    sx={{
                      flexGrow: 1,
                      borderRadius: 1,
                      overflow: "hidden",
                      position: "relative",
                      minHeight: 300,
                      mb: 2,
                    }}
                  >
                    <Image
                      src={generatedImageUrl}
                      alt="Generated Ghibli-style image"
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<SaveAltIcon />}
                    onClick={handleDownloadImage}
                    sx={{ mt: "auto" }}
                  >
                    Download Image
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.default",
                    borderRadius: 1,
                    p: 4,
                    minHeight: 300,
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography color="text.secondary" align="center">
                    Your Ghibli-style image will appear here after generation
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", color: "primary.dark" }}
          >
            About Ghibli Style Transformation
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://images.unsplash.com/photo-1585255318859-f5c15f4cffe9?q=80&w=500&auto=format&fit=crop"
                  alt="Ghibli style example"
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    Watercolor Aesthetic
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Studio Ghibli's signature style features soft
                    watercolor-like textures with delicate brush strokes and
                    gentle color gradients.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://images.unsplash.com/photo-1608889175638-9322300c5477?q=80&w=500&auto=format&fit=crop"
                  alt="Ghibli style example"
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    Character Design
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Characters feature simplified, expressive features with
                    slightly larger eyes and natural proportions that maintain
                    human realism.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=500&auto=format&fit=crop"
                  alt="Ghibli style example"
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    Magical Atmosphere
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Environments often include magical elements like floating
                    particles, dream-like lighting, and rich atmospheric
                    details.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <ProviderKeyModal
        open={showProviderKeyModal}
        onClose={() => setShowProviderKeyModal(false)}
        onSubmit={handleCustomApiKeySubmit}
        aiProvider={
          aiProviders.find((p) => p.id === selectedProvider) || aiProviders[0]
        }
        onSubscribe={() => {
          setShowProviderKeyModal(false)
          setShowSubscriptionModal(true)
        }}
      />

      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      <Footer />
    </Box>
  )
}
