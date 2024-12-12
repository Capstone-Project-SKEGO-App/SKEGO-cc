# Gunakan Node.js sebagai base image
FROM node:18

# Set working directory di container
WORKDIR /usr/src/app

# Salin file package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file ke container
COPY . .

# Expose port 8080 untuk Cloud Run
EXPOSE 8080

# Jalankan aplikasi
CMD ["npm", "start"]
