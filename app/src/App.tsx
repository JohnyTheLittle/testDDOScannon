import React, { useEffect, useState } from 'react'
import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import axios from 'axios'
import { Alert, Button, Card, Col, Input, Modal, Row } from 'antd'

const API_URL = 'http://localhost:3000/messages'
const WS_URL = 'ws://localhost:9090/'

const queryClient = new QueryClient()

type Message = {
  _id: string
  text: string
  createdAt: Date
}

const App: React.FC = () => {
  const [newMessage, setNewMessage] = useState('')
  const [numberOfAttacks, setNumberOfAttacks] = useState(1)

  // Получение сообщений
  const { data: messages = [], refetch } = useQuery<Message[]>(
    'messages',
    async () => {
      const response = await axios.get(API_URL)
      return response.data
    },
    {}
  )

  // Мутация для создания нового сообщения
  const { mutate: createMessage } = useMutation(
    async (text: string) => {
      await axios.post(API_URL, { text })
    },
    {
      onSuccess: () => {
        setNewMessage('')
      },
    },
  )

  // Мутация для отправки одного сообщения 12 раз (DDoS-атака 😈)
  const { mutate: sendCurrentMessageNTimes } = useMutation(
    async (text: string) => {
      await Promise.all(
        new Array(numberOfAttacks).fill(null).map((_e, i) => axios.post(API_URL, { text: `${text} ${i}` })),
      )
    },
  )

  // Мутация для удаления всех сообщений
  const { mutate: destroyAllData } = useMutation(
    async () => {
      await axios.delete(API_URL)
    },
    {
      onSuccess: () => {
        // Очищаем кэшированные данные в react-query
        queryClient.setQueryData<Message[]>('messages', [])
      },
      onError: (err) => {
        console.error(err)
      },
    },
  )

  // WebSocket для получения новых сообщений
  useEffect(() => {
    let ws: WebSocket | null = null

    const connectWebSocket = () => {
      ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log('WebSocket connection established')
      }

      ws.onmessage = (event) => {
        const newMessages: Message[] = JSON.parse(event.data)
        console.log({ newMessage })
        queryClient.setQueryData<Message[]>('messages', (oldMessages = []) => {
          console.log({messages, oldMessages})
          const uniqueMessages = newMessages.filter(
            (newMsg) =>!oldMessages.some((oldMsg) => oldMsg._id === newMsg._id),
          )
          return [...oldMessages, ...uniqueMessages]
        })
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting...')
        setTimeout(connectWebSocket, 5000) // Попытка переподключения через 5 секунд
      }
    }

    connectWebSocket()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  return (
    <div>
      <Modal
        title={'DDOS CANON'}
        width={'1000px'}
        open={true}
        closable={false}
        footer={[
          <Button key="0" onClick={() => createMessage(newMessage)}>
            Send
          </Button>,
          <Button key="1" onClick={() => sendCurrentMessageNTimes(newMessage)}>
            Start DDoS Attack {numberOfAttacks} times
          </Button>,
          <Button key="2" onClick={() => destroyAllData()}>
            DELETE ALL MESSAGES
          </Button>,
        ]}
      >
        <Card
          title={
            <Row gutter={[8, 8]}>
              <Col span={16}>
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </Col>
              <Col span={8}>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={numberOfAttacks}
                  onChange={(e) => setNumberOfAttacks(Number(e.target.value))}
                />
              </Col>
            </Row>
          }
        >
          {messages.map((msg: Message) => {
            return <Alert key={msg._id} message={msg.text} />
          })}
        </Card>
      </Modal>
    </div>
  )
}

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}
