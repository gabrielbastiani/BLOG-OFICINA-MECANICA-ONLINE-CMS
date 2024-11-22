

export default function Post({ params }: { params: { post_id: string } }) {


    return (
        <h1>{params.post_id}</h1>
    )
}