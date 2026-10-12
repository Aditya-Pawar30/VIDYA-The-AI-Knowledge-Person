import chromadb
from app.embeddings import create_embeddings

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="vidya_documents"
)


def store_chunks(chunks, embeddings):
    ids = [f"chunk_{i}" for i in range(len(chunks))]

    embeddings_list = embeddings.tolist() if hasattr(embeddings, "tolist") else embeddings

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings_list
    )


def search(query, n_results=3):
    query_embedding = create_embeddings([query])[0]
    query_embedding_list = query_embedding.tolist() if hasattr(query_embedding, "tolist") else query_embedding

    results = collection.query(
        query_embeddings=[query_embedding_list],
        n_results=n_results
    )

    return results

