"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save, Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { listTestimonials, saveTestimonial, removeTestimonial } from "./actions"

type AdminTestimonial = {
  id?: string
  quote: string
  author: string
  role?: string
  badge?: string
  rating?: number
}

const DEFAULT_T: AdminTestimonial = {
  quote: "",
  author: "",
  role: "",
  badge: "",
  rating: 5,
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<AdminTestimonial[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await listTestimonials()
        if (mounted) setItems(data)
      } catch (err: any) {
        if (mounted) {
          setItems([])
          toast({ title: "Failed to load testimonials", description: String(err?.message || err), variant: "destructive" })
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [toast])

  function persist(next: AdminTestimonial[]) {
    console.log('Persisting items:', next)
    setItems([...next]) // Create a new array to ensure reactivity
    // Ensure the selected item is still valid after update
    if (selected !== null && selected >= next.length) {
      setSelected(null)
    }
  }

  function addItem() {
    const newItem = { ...DEFAULT_T }
    persist([newItem, ...items])
    setSelected(0)
  }

  async function removeItem(index: number) {
    try {
      const toRemove = items[index]
      if (!toRemove) return
      
      if (toRemove.id) {
        // Only call removeTestimonial if the item has an ID (was saved to the database)
        await removeTestimonial(toRemove.id)
      }
      
      // Remove from local state
      const next = items.filter((_, i) => i !== index)
      persist(next)
      setSelected(null)
      
      if (toRemove.author) {
        toast({ title: "Deleted", description: `${toRemove.author} removed` })
      }
    } catch (err: any) {
      toast({ 
        title: "Delete failed", 
        description: String(err?.message || err), 
        variant: "destructive" 
      })
    }
  }

  function updateSelected(update: Partial<AdminTestimonial>) {
    console.log('Updating selected:', update)
    if (selected === null || selected === undefined || selected >= items.length) {
      console.error('Cannot update: invalid selected index', { selected, itemsLength: items.length })
      return
    }
    
    const currentItem = items[selected]
    if (!currentItem) {
      console.error('Cannot update: selected item is undefined', { selected, items })
      return
    }
    
    const updatedItem = { ...currentItem, ...update }
    const nextItems = [...items]
    nextItems[selected] = updatedItem
    
    console.log('Updated item:', updatedItem)
    persist(nextItems)
  }

  async function handleSave() {
    if (selected === null || selected >= items.length) {
      toast({ 
        title: "Save Failed", 
        description: "Please select a testimonial to save", 
        variant: "destructive" 
      });
      return;
    }

    const testimonial = items[selected];
    
    // Basic validation
    if (!testimonial.quote?.trim()) {
      toast({ 
        title: "Save Failed", 
        description: "Quote is required", 
        variant: "destructive" 
      });
      return;
    }

    if (!testimonial.author?.trim()) {
      toast({ 
        title: "Save Failed", 
        description: "Author is required", 
        variant: "destructive" 
      });
      return;
    }

    setIsSaving(true);
    setJustSaved(false);

    try {
      await saveTestimonial(testimonial);
      const refreshed = await listTestimonials();
      setItems(refreshed);
      
      // Update selection to the saved item
      if (testimonial.id) {
        const index = refreshed.findIndex(t => t.id === testimonial.id);
        if (index >= 0) setSelected(index);
      } else if (refreshed.length > 0) {
        // If it was a new item, select the first one
        setSelected(0);
      }
      
      setJustSaved(true);
      toast({ 
        title: "✓ Saved Successfully", 
        description: `${testimonial.author}'s testimonial has been saved.`,
        variant: "default" as const
      });
    } catch (err: any) {
      console.error('Error saving testimonial:', err);
      toast({ 
        title: "Save Failed", 
        description: err?.message || 'Failed to save testimonial',
        variant: "destructive" as const
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <div className="flex items-center justify-between">
          <h2 className="bg-gradient-to-r from-fuchsia-400 via-fuchsia-200 to-cyan-300 bg-clip-text text-2xl md:text-3xl font-bold font-mono tracking-tight text-transparent">Testimonials</h2>
          <Button size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        <div className="grid gap-2">
          {items.length === 0 && (
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="p-4 text-sm text-gray-400">No testimonials yet. Click Add to create.</CardContent>
            </Card>
          )}
          {items.map((t, i) => (
            <Card key={i} className={cn("border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-gray-900/70", selected === i && "border-emerald-600/60 shadow-[0_0_20px_rgba(52,211,153,0.15)]") }>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium truncate">{t.author || "Unknown"}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelected(i)}>
                    Edit
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => removeItem(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-400">{t.role || "Role"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selected == null || selected >= items.length || !items[selected] ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent className="p-6 text-sm text-gray-400">
              {items.length === 0 ? 'No testimonials available. Click "Add" to create one.' : 'Select a testimonial to edit'}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Edit Testimonial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea 
                  rows={4} 
                  value={items[selected]?.quote || ''} 
                  onChange={(e) => updateSelected({ quote: e.target.value })} 
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input 
                    value={items[selected]?.author || ''} 
                    onChange={(e) => updateSelected({ author: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input 
                    value={items[selected]?.role || ''} 
                    onChange={(e) => updateSelected({ role: e.target.value })} 
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input 
                    value={items[selected]?.badge || ''} 
                    onChange={(e) => updateSelected({ badge: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={items[selected]?.rating ?? 5}
                    onChange={(e) => updateSelected({ rating: Math.max(1, Math.min(5, Number(e.target.value) || 5)) })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Save button clicked, selected index:', selected);
                  handleSave();
                }}
                disabled={isSaving || selected === null}
                className={cn(
                  "transition-all duration-300",
                  isSaving && "bg-cyan-600 hover:bg-cyan-600 shadow-[0_0_24px] shadow-cyan-600/30",
                  justSaved && "bg-emerald-600 hover:bg-emerald-600 shadow-[0_0_24px] shadow-emerald-600/30",
                  !isSaving && !justSaved && "bg-fuchsia-600 hover:bg-fuchsia-500",
                  selected === null && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : justSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Saved
                  </>
                ) : selected === null ? (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Select a testimonial to edit
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}


