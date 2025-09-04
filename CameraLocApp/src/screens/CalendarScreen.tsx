import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Photo } from '../types';
import { StorageService } from '../services/StorageService';

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photosForSelectedDate, setPhotosForSelectedDate] = useState<Photo[]>([]);
  const [photoDates, setPhotoDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    loadPhotosForDate(selectedDate);
  }, [selectedDate, photos]);

  const loadPhotos = async () => {
    try {
      const photosData = await StorageService.getPhotos();
      setPhotos(photosData);
      
      // Créer un Set des dates qui ont des photos pour le calendrier
      const dates = new Set<string>();
      photosData.forEach(photo => {
        const dateStr = formatDateKey(photo.timestamp);
        dates.add(dateStr);
      });
      setPhotoDates(dates);
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error);
      Alert.alert('Erreur', 'Impossible de charger les photos');
    }
  };

  const loadPhotosForDate = async (date: Date) => {
    try {
      const photosForDate = await StorageService.getPhotosByDate(date);
      setPhotosForSelectedDate(photosForDate);
    } catch (error) {
      console.error('Erreur lors du chargement des photos pour la date:', error);
    }
  };

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onPhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const getPhotoStats = () => {
    const today = new Date();
    const thisWeek = getWeekStart(today);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayPhotos = photos.filter(photo => 
      formatDateKey(photo.timestamp) === formatDateKey(today)
    ).length;

    const weekPhotos = photos.filter(photo => 
      photo.timestamp >= thisWeek
    ).length;

    const monthPhotos = photos.filter(photo => 
      photo.timestamp >= thisMonth
    ).length;

    return { todayPhotos, weekPhotos, monthPhotos };
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        hasPhotos: false,
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      days.push({
        date,
        isCurrentMonth: true,
        hasPhotos: photoDates.has(dateKey),
      });
    }
    
    return days;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const isSelectedDate = (date: Date) => {
    return formatDateKey(date) === formatDateKey(selectedDate);
  };

  const stats = getPhotoStats();
  const calendarDays = generateCalendarDays();

  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => onPhotoPress(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.photoThumbnail} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoTime}>{formatTime(item.timestamp)}</Text>
        {item.locationName && (
          <Text style={styles.photoLocation} numberOfLines={1}>
            📍 {item.locationName}
          </Text>
        )}
        <Text style={styles.photoCoords}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Calendrier</Text>
      
      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.todayPhotos}</Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.weekPhotos}</Text>
          <Text style={styles.statLabel}>Cette semaine</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.monthPhotos}</Text>
          <Text style={styles.statLabel}>Ce mois</Text>
        </View>
      </View>

      {/* Calendrier */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth('prev')}>
            <Text style={styles.navButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => changeMonth('next')}>
            <Text style={styles.navButton}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekDaysHeader}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <Text key={index} style={styles.weekDay}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {calendarDays.map((dayInfo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                !dayInfo.isCurrentMonth && styles.otherMonthDay,
                dayInfo.hasPhotos && styles.dayWithPhotos,
                isSelectedDate(dayInfo.date) && styles.selectedDay,
              ]}
              onPress={() => selectDate(dayInfo.date)}
            >
              <Text style={[
                styles.dayText,
                !dayInfo.isCurrentMonth && styles.otherMonthText,
                isSelectedDate(dayInfo.date) && styles.selectedDayText,
              ]}>
                {dayInfo.date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Photos pour la date sélectionnée */}
      <View style={styles.photosSection}>
        <Text style={styles.sectionTitle}>
          Photos du {formatDate(selectedDate)}
        </Text>
        
        {photosForSelectedDate.length > 0 ? (
          <FlatList
            data={photosForSelectedDate}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id}
            style={styles.photosContainer}
          />
        ) : (
          <View style={styles.noPhotosContainer}>
            <Text style={styles.noPhotosText}>
              Aucune photo pour cette date
            </Text>
            <Text style={styles.noPhotosSubtext}>
              Prenez une photo pour commencer votre journal !
            </Text>
          </View>
        )}
      </View>

      {/* Modal pour les détails de photo */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <>
                <Text style={styles.modalTitle}>📷 Détails de la photo</Text>
                <Image 
                  source={{ uri: selectedPhoto.uri }} 
                  style={styles.modalImage} 
                />
                <View style={styles.photoDetails}>
                  <Text style={styles.detailText}>
                    📅 {formatDate(selectedPhoto.timestamp)}
                  </Text>
                  <Text style={styles.detailText}>
                    ⏰ {formatTime(selectedPhoto.timestamp)}
                  </Text>
                  {selectedPhoto.locationName && (
                    <Text style={styles.detailText}>
                      📍 {selectedPhoto.locationName}
                    </Text>
                  )}
                  <Text style={styles.detailText}>
                    🌍 {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowPhotoModal(false)}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navButton: {
    fontSize: 24,
    color: '#3498db',
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 2,
  },
  dayText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#bdc3c7',
  },
  dayWithPhotos: {
    backgroundColor: '#e8f4fd',
  },
  selectedDay: {
    backgroundColor: '#3498db',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photosSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  photosContainer: {
    flex: 1,
  },
  photoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  photoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  photoTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  photoLocation: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 5,
  },
  photoCoords: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  noPhotosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noPhotosText: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10,
  },
  noPhotosSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  photoDetails: {
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CalendarScreen;
