import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { audioService, useAudioSettings, VOLUME_STEP } from '../services/audio';

interface VolumeRowProps {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

function VolumeRow({ label, value, disabled, onChange }: VolumeRowProps) {
  const percent = Math.round(value * 100);

  const change = (delta: number) => {
    // arredonda para evitar 0.30000000004
    onChange(Math.round((value + delta) * 100) / 100);
    audioService.playSoundEffect('button_click');
  };

  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepButton}
          onPress={() => change(-VOLUME_STEP)}
          disabled={value <= 0}
          accessibilityRole="button"
          accessibilityLabel={`Diminuir ${label}`}
        >
          <Text style={styles.stepText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.value}>{percent}%</Text>
        <TouchableOpacity
          style={styles.stepButton}
          onPress={() => change(VOLUME_STEP)}
          disabled={value >= 1}
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${label}`}
        >
          <Text style={styles.stepText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AudioSettingsPanel() {
  const { masterVolume, musicVolume, sfxVolume, muted } = useAudioSettings();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Áudio</Text>
        <TouchableOpacity
          style={[styles.muteButton, muted && styles.muteButtonActive]}
          onPress={() => {
            audioService.toggleMute();
            audioService.playSoundEffect('button_click'); // só soa ao desmutar
          }}
          accessibilityRole="switch"
          accessibilityState={{ checked: muted }}
        >
          <Text style={styles.muteText}>
            {muted ? 'Som desligado' : 'Som ligado'}
          </Text>
        </TouchableOpacity>
      </View>

      <VolumeRow
        label="Volume geral"
        value={masterVolume}
        disabled={muted}
        onChange={audioService.setMasterVolume}
      />
      <VolumeRow
        label="Música"
        value={musicVolume}
        disabled={muted}
        onChange={audioService.setBackgroundMusicVolume}
      />
      <VolumeRow
        label="Efeitos"
        value={sfxVolume}
        disabled={muted}
        onChange={audioService.setSoundEffectVolume}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowLabel: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepButton: {
    width: 34,
    height: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  stepText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  value: {
    width: 44,
    textAlign: 'center',
    fontSize: 14,
    color: '#FFFFFF',
  },
  muteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#1E1E1E',
  },
  muteButtonActive: {
    borderColor: '#EF9A9A',
  },
  muteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
