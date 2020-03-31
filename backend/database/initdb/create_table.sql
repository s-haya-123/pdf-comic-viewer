CREATE TABLE comic (
    id integer NOT null UNIQUE,
    author text,
    title text NOT null,
    thumbnail text,
    pdf text,
    tag text[]
);