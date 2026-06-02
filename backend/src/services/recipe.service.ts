import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';

export function getAllRecipes(category?: string, page = 1, limit = 20) {
  const db = getDb();

  let whereClause = '';
  const params: any[] = [];

  if (category && category !== 'all' && category !== '全部') {
    whereClause = 'WHERE category = ?';
    params.push(category);
  }

  const countResult = db.prepare(`SELECT COUNT(*) as total FROM recipes ${whereClause}`).get(...params) as { total: number };
  const offset = (page - 1) * limit;

  const recipes = db.prepare(
    `SELECT * FROM recipes ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  return { recipes, total: countResult.total, page, limit };
}

export function getRecipeById(id: string) {
  const db = getDb();
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
  if (recipe) {
    (recipe as any).ingredients = JSON.parse((recipe as any).ingredients);
    (recipe as any).steps = JSON.parse((recipe as any).steps);
    (recipe as any).tags = JSON.parse((recipe as any).tags);
  }
  return recipe;
}

export function createRecipe(data: any) {
  const db = getDb();
  const id = generateId();

  db.prepare(`
    INSERT INTO recipes (id, name, category, cover_emoji, description, calories, protein, carbs, fat, cook_time, servings, difficulty, ingredients, steps, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name, data.category, data.coverEmoji || '🍽️', data.description || '',
    data.calories || 0, data.protein || 0, data.carbs || 0, data.fat || 0,
    data.cookTime || 0, data.servings || 1, data.difficulty || 'easy',
    JSON.stringify(data.ingredients || []), JSON.stringify(data.steps || []),
    JSON.stringify(data.tags || []),
  );

  return getRecipeById(id);
}

export function updateRecipe(id: string, data: any): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM recipes WHERE id = ?').get(id);
  if (!existing) return false;

  const fields: string[] = [];
  const params: any[] = [];

  const fieldMap: Record<string, string> = {
    name: 'name', category: 'category', coverEmoji: 'cover_emoji',
    description: 'description', calories: 'calories', protein: 'protein',
    carbs: 'carbs', fat: 'fat', cookTime: 'cook_time', servings: 'servings',
    difficulty: 'difficulty',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = ?`);
      params.push(data[key]);
    }
  }

  if (data.ingredients) { fields.push('ingredients = ?'); params.push(JSON.stringify(data.ingredients)); }
  if (data.steps) { fields.push('steps = ?'); params.push(JSON.stringify(data.steps)); }
  if (data.tags) { fields.push('tags = ?'); params.push(JSON.stringify(data.tags)); }

  if (fields.length === 0) return true;

  fields.push('updated_at = datetime(\'now\')');
  params.push(id);

  db.prepare(`UPDATE recipes SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return true;
}

export function deleteRecipe(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
  return result.changes > 0;
}
