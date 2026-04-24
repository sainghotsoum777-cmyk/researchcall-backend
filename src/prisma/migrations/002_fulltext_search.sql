-- ─────────────────────────────────────────────────────────
-- Migration : Activation de la recherche full-text PostgreSQL
-- ResearchCall MVP — Phase 3
--
-- Active pg_trgm pour la recherche floue (fuzzy)
-- Crée une colonne tsvector + index GIN pour la recherche rapide
-- ─────────────────────────────────────────────────────────

-- 1. Activer l'extension pg_trgm (recherche floue)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Activer l'extension unaccent (ignorer les accents)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 3. Créer une configuration de recherche française sans accents
CREATE TEXT SEARCH CONFIGURATION french_unaccent (COPY = french);
ALTER TEXT SEARCH CONFIGURATION french_unaccent
  ALTER MAPPING FOR hword, hword_part, word
  WITH unaccent, french_stem;

-- 4. Ajouter une colonne tsvector pour la recherche full-text
ALTER TABLE calls ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 5. Créer l'index GIN sur le vecteur de recherche
CREATE INDEX IF NOT EXISTS idx_calls_search_vector
  ON calls USING GIN (search_vector);

-- 6. Créer un index trigram sur le titre pour la recherche floue
CREATE INDEX IF NOT EXISTS idx_calls_title_trgm
  ON calls USING GIN (title gin_trgm_ops);

-- 7. Créer un index trigram sur la description
CREATE INDEX IF NOT EXISTS idx_calls_description_trgm
  ON calls USING GIN (description gin_trgm_ops);

-- 8. Fonction pour mettre à jour le vecteur de recherche
CREATE OR REPLACE FUNCTION update_call_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.submission_conditions, '')), 'C') ||
    setweight(to_tsvector('french_unaccent', COALESCE(array_to_string(NEW.domains, ' '), '')), 'B') ||
    setweight(to_tsvector('french_unaccent', COALESCE(array_to_string(NEW.thematic_axes, ' '), '')), 'B') ||
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.location_city, '')), 'D') ||
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.location_country, '')), 'D') ||
    setweight(to_tsvector('french_unaccent', COALESCE(NEW.contact_email, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger pour maintenir le vecteur à jour
DROP TRIGGER IF EXISTS trg_calls_search_vector ON calls;
CREATE TRIGGER trg_calls_search_vector
  BEFORE INSERT OR UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_call_search_vector();

-- 10. Initialiser le vecteur pour les données existantes
UPDATE calls SET search_vector =
  setweight(to_tsvector('french_unaccent', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('french_unaccent', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('french_unaccent', COALESCE(submission_conditions, '')), 'C') ||
  setweight(to_tsvector('french_unaccent', COALESCE(array_to_string(domains, ' '), '')), 'B') ||
  setweight(to_tsvector('french_unaccent', COALESCE(array_to_string(thematic_axes, ' '), '')), 'B') ||
  setweight(to_tsvector('french_unaccent', COALESCE(location_city, '')), 'D') ||
  setweight(to_tsvector('french_unaccent', COALESCE(location_country, '')), 'D') ||
  setweight(to_tsvector('french_unaccent', COALESCE(contact_email, '')), 'D');
