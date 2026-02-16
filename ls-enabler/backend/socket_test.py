import socket
import time

def test_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 8000))
        s.listen(1)
        print("Server listening on port 8000...")
        
        while True:
            conn, addr = s.accept()
            with conn:
                print(f"Connected by {addr}")
                data = conn.recv(1024)
                if not data:
                    break
                print(f"Received: {data[:100]}...")
                
                response = b"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\n\r\n{\"message\": \"Server is working\"}"
                conn.sendall(response)
                break
        print("Connection handled, server continues...")

if __name__ == "__main__":
    test_server()