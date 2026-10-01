import React, { useState, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import { toast } from '../../components/ui/Toast';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Clock, 
  DollarSign, 
  Layers, 
  Eye, 
  Sparkles, 
  Check, 
  X,
  Flame,
  Pizza,
  Coffee,
  Wine
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  dietary: 'Veg' | 'Non-Veg' | 'Beverage';
  prepTimeMinutes: number;
  isAvailable: boolean;
  calories?: number;
}

export default function MenuCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    sellingPrice: '',
    costPrice: '',
    dietary: 'Non-Veg',
    prepTimeMinutes: '15',
    calories: '450',
    isAvailable: true,
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Royal Mutton Karahi (Full)', category: 'Main Course', sellingPrice: 2800, costPrice: 1650, dietary: 'Non-Veg', prepTimeMinutes: 25, isAvailable: true, calories: 920 },
    { id: '2', name: 'Chicken Manchurian & Egg Fried Rice', category: 'Main Course', sellingPrice: 1150, costPrice: 520, dietary: 'Non-Veg', prepTimeMinutes: 18, isAvailable: true, calories: 750 },
    { id: '3', name: 'Thin Crust Pepperoni Pizza (Large)', category: 'Fast Food', sellingPrice: 1450, costPrice: 620, dietary: 'Non-Veg', prepTimeMinutes: 15, isAvailable: true, calories: 1200 },
    { id: '4', name: 'Double Smash Gourmet Beef Burger', category: 'Fast Food', sellingPrice: 890, costPrice: 380, dietary: 'Non-Veg', prepTimeMinutes: 14, isAvailable: true, calories: 840 },
    { id: '5', name: 'Crispy Buffalo Hot Wings (8 Pcs)', category: 'Starters', sellingPrice: 650, costPrice: 260, dietary: 'Non-Veg', prepTimeMinutes: 12, isAvailable: true, calories: 510 },
    { id: '6', name: 'Garlic Butter Parmesan Fries', category: 'Starters', sellingPrice: 380, costPrice: 110, dietary: 'Veg', prepTimeMinutes: 8, isAvailable: true, calories: 380 },
    { id: '7', name: 'Paneer Butter Handi', category: 'Main Course', sellingPrice: 950, costPrice: 390, dietary: 'Veg', prepTimeMinutes: 16, isAvailable: true, calories: 640 },
    { id: '8', name: 'Mint Margarita Chiller', category: 'Beverages', sellingPrice: 290, costPrice: 70, dietary: 'Beverage', prepTimeMinutes: 5, isAvailable: true, calories: 140 },
    { id: '9', name: 'Spanish Iced Latte with Vanilla Foam', category: 'Beverages', sellingPrice: 480, costPrice: 130, dietary: 'Beverage', prepTimeMinutes: 6, isAvailable: true, calories: 220 },
    { id: '10', name: 'Sizzling Hot Brownie with Vanilla Gelato', category: 'Desserts', sellingPrice: 550, costPrice: 180, dietary: 'Veg', prepTimeMinutes: 8, isAvailable: false, calories: 580 },
  ]);

  const categories = ['All', 'Starters', 'Main Course', 'Fast Food', 'Beverages', 'Desserts'];

  const categoryOptions = [
    { value: 'Starters', label: 'Starters & Appetizers' },
    { value: 'Main Course', label: 'Main Course' },
    { value: 'Fast Food', label: 'Burgers & Pizza' },
    { value: 'Beverages', label: 'Beverages & Mocktails' },
    { value: 'Desserts', label: 'Desserts & Sweets' },
  ];

  const dietaryOptions = [
    { value: 'Non-Veg', label: 'Non-Vegetarian (Meat / Poultry)' },
    { value: 'Veg', label: 'Vegetarian' },
    { value: 'Beverage', label: 'Beverage / Drink' },
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    const totalDishes = menuItems.length;
    const activeDishes = menuItems.filter(i => i.isAvailable).length;
    const avgMargin = Math.round(
      menuItems.reduce((acc, i) => acc + ((i.sellingPrice - i.costPrice) / i.sellingPrice) * 100, 0) / (totalDishes || 1)
    );
    return { totalDishes, activeDishes, avgMargin };
  }, [menuItems]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Main Course',
      sellingPrice: '',
      costPrice: '',
      dietary: 'Non-Veg',
      prepTimeMinutes: '15',
      calories: '450',
      isAvailable: true,
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      sellingPrice: item.sellingPrice.toString(),
      costPrice: item.costPrice.toString(),
      dietary: item.dietary,
      prepTimeMinutes: item.prepTimeMinutes.toString(),
      calories: (item.calories || 0).toString(),
      isAvailable: item.isAvailable,
    });
    setIsDrawerOpen(true);
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = !item.isAvailable;
        toast.info(`${item.name} is now ${updated ? 'Available' : 'Unavailable'}`);
        return { ...item, isAvailable: updated };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== id));
    toast.success('Dish removed from catalog');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sellingPrice) {
      toast.error('Dish name and selling price are required');
      return;
    }

    const price = parseFloat(formData.sellingPrice) || 0;
    const cost = parseFloat(formData.costPrice) || 0;
    const prep = parseInt(formData.prepTimeMinutes, 10) || 10;
    const cal = parseInt(formData.calories, 10) || 0;

    if (editingItem) {
      setMenuItems(prev => prev.map(item => item.id === editingItem.id ? {
        ...item,
        name: formData.name,
        category: formData.category,
        sellingPrice: price,
        costPrice: cost,
        dietary: formData.dietary as any,
        prepTimeMinutes: prep,
        calories: cal,
        isAvailable: formData.isAvailable,
      } : item));
      toast.success('Dish details updated');
    } else {
      const newItem: MenuItem = {
        id: `dish-${Date.now()}`,
        name: formData.name,
        category: formData.category,
        sellingPrice: price,
        costPrice: cost,
        dietary: formData.dietary as any,
        prepTimeMinutes: prep,
        calories: cal,
        isAvailable: formData.isAvailable,
      };
      setMenuItems(prev => [newItem, ...prev]);
      toast.success('New dish added to menu');
    }
    setIsDrawerOpen(false);
  };

  return (
    <>
      <PageMeta title="Menu & Category Management" description="Restaurant Food Menu & Catalog" />

      <div className="w-full space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto pb-12">
        <Breadcrumb items={[{ label: 'Catalog' }, { label: 'Food Menu & Dishes' }]} />

        {/* KPI STAT CARDS */}
        <StatCards
          stats={[
            { title: 'Total Menu Dishes', value: `${stats.totalDishes} Items`, icon: <UtensilsCrossed className="w-5 h-5" />, theme: 'brand' },
            { title: 'Currently In Stock', value: `${stats.activeDishes} Available`, icon: <Check className="w-5 h-5" />, theme: 'success' },
            { title: 'Average Food Margin', value: `${stats.avgMargin}% Profit`, icon: <Sparkles className="w-5 h-5" />, theme: 'indigo' },
            { title: 'Menu Categories', value: '5 Categories', icon: <Layers className="w-5 h-5" />, theme: 'warning' },
          ]}
        />

        {/* CONTROLS TOOLBAR */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by dish name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="w-full md:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Dish
            </button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* DISHES DATA TABLE */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4">Dish Information</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4">Cost & Margin</th>
                  <th className="px-6 py-4">Prep Time</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {filteredItems.map(item => {
                  const marginPercent = Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            item.dietary === 'Veg'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                              : item.dietary === 'Non-Veg'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800'
                              : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800'
                          }`}>
                            {item.dietary === 'Veg' ? '🌱' : item.dietary === 'Non-Veg' ? '🍗' : '🍹'}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white text-sm block">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {item.calories ? `${item.calories} kcal • ` : ''}{item.dietary}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          PKR {item.sellingPrice.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="text-gray-500 text-[11px] block">Cost: PKR {item.costPrice}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            {marginPercent}% Margin
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {item.prepTimeMinutes} mins
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ActionMenu
                          actions={[
                            {
                              label: 'Edit Dish Details',
                              icon: <Edit3 className="w-4 h-4" />,
                              onClick: () => handleOpenEdit(item),
                            },
                            {
                              label: item.isAvailable ? 'Mark Out of Stock' : 'Mark In Stock',
                              icon: item.isAvailable ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />,
                              onClick: () => handleToggleAvailability(item.id),
                            },
                            {
                              label: 'Delete Dish',
                              icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                              onClick: () => handleDeleteItem(item.id),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE / EDIT DISH PROFILE DRAWER */}
        <ProfileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={editingItem ? 'Edit Dish Profile' : 'Add New Dish to Menu'}
          subtitle={editingItem ? editingItem.name : 'Configure pricing, portion and kitchen instructions'}
        >
          <form onSubmit={handleSaveForm} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Dish Title / Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Royal Chicken Karahi"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Category
              </label>
              <SearchableSelect
                options={categoryOptions}
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Selling Price (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                  placeholder="e.g. 1200"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Food Cost Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                  placeholder="e.g. 550"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Dietary Type
              </label>
              <SearchableSelect
                options={dietaryOptions}
                value={formData.dietary}
                onChange={(val) => setFormData(prev => ({ ...prev, dietary: val }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Prep Time (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.prepTimeMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, prepTimeMinutes: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 cursor-pointer"
              >
                Save Dish
              </button>
            </div>
          </form>
        </ProfileDrawer>

      </div>
    </>
  );
}
