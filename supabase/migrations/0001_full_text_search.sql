-- pg_trgm 확장 활성화 (한국어 trigram 유사도 검색)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

--> statement-breakpoint

-- tiptap JSON에서 텍스트를 재귀적으로 추출하는 함수
CREATE OR REPLACE FUNCTION extract_tiptap_text(doc jsonb) RETURNS text AS $$
DECLARE
  result text := '';
  child jsonb;
BEGIN
  IF doc IS NULL THEN
    RETURN '';
  END IF;

  IF doc ? 'text' AND doc->>'type' = 'text' THEN
    result := result || ' ' || (doc->>'text');
  END IF;

  IF doc ? 'content' AND jsonb_typeof(doc->'content') = 'array' THEN
    FOR child IN SELECT jsonb_array_elements(doc->'content')
    LOOP
      result := result || extract_tiptap_text(child);
    END LOOP;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

--> statement-breakpoint

-- search_vector 컬럼 추가
ALTER TABLE "posts" ADD COLUMN "search_vector" tsvector;

--> statement-breakpoint

-- search_vector 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(extract_tiptap_text(NEW.content), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--> statement-breakpoint

-- INSERT/UPDATE 시 search_vector 자동 갱신
CREATE TRIGGER posts_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, content ON posts
  FOR EACH ROW
  EXECUTE FUNCTION posts_search_vector_update();

--> statement-breakpoint

-- 기존 데이터에 search_vector 반영
UPDATE posts SET search_vector = to_tsvector('simple',
  coalesce(title, '') || ' ' ||
  coalesce(extract_tiptap_text(content), '')
);

--> statement-breakpoint

-- GIN 인덱스: tsvector 전문 검색용
CREATE INDEX idx_posts_search_vector ON posts USING GIN (search_vector);

--> statement-breakpoint

-- GIN 인덱스: pg_trgm 기반 한국어 제목 검색용
CREATE INDEX idx_posts_title_trgm ON posts USING GIN (title gin_trgm_ops);
