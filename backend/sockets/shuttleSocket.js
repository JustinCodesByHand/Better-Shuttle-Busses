module.exports = (io, simulation) => {
  io.on('connection', (socket) => {
    // Send initial snapshot
    socket.emit('vehicles:update', simulation.getVehicles());

    const interval = setInterval(() => {
      socket.emit('vehicles:update', simulation.getVehicles());
    }, 5000);

    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  });
};
