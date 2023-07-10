import React, { useState, useRef } from "react"
import { Header } from '../Utilities/Header'
import { Container, Table, Button, Alert, FormControl, InputGroup } from 'react-bootstrap'
import { useAuth } from "../contexts/AuthContext"

export const Dashboard = () => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const descriptionRef = useRef()
  const { createPost } = useAuth()

  async function uploadNewPost() {

    setLoading(true)
    setSuccess("")
    setError("")

    try {

      const unixTime = Math.floor(Date.now() / 1000);

      const result = await createPost(descriptionRef.current.value, 'imgPublicUrl', unixTime)
      if (result && result.error) throw result
      setSuccess(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      descriptionRef.current.value = ""
    }
  }

  return (
    <>
      <Header />
      <Container className="d-flex align-items-center justify-content-center">
        <div className="w-100" style={{ maxWidth: "450px", marginTop: 50 }}>
          <h2 className="text-center mb-4">Create Post</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Table striped bordered hover responsive style={{ marginTop: 10 }}>
            <tbody>
              <tr>
                <td colSpan={2}  >
                  <InputGroup >
                    <FormControl type="text" ref={descriptionRef} placeholder="Description" />
                  </InputGroup>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <Button disabled={loading} className="w-100" onClick={uploadNewPost}>
                    Add New Post
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Container >
    </>
  )
}