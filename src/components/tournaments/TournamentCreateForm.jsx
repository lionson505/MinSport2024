import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar, MapPin, Clock, Trophy, Users } from 'lucide-react';
import { useTournaments } from '../../hooks/useTournaments';
import { toast } from 'react-hot-toast';
import { locations } from '../../data/locations';

export default function TournamentCreateForm({ initialTournamentType, lockTournamentType = false, onSuccess }) {
  const { createTournament, updateTournament, loading } = useTournaments();

  // Support edit mode via props
  const propsAny = arguments[0] || {};
  const mode = propsAny.mode || 'create'; // 'create' | 'edit'
  const initialValues = propsAny.initialValues || null; // tournament object when editing

  const [form, setForm] = useState({
    type: initialTournamentType || '', // 'umurenge_kagame' | 'inter_universities'
    name: '',
    season: '',
    location: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    status: 'upcoming', // upcoming | active | completed | cancelled
    description: '',
    operatorLevel: '', // umurenge | district | university
  });

  const [errors, setErrors] = useState({});
  const [geo, setGeo] = useState({ province: '', district: '', sector: '' });

  // Apply business rules depending on type
  useEffect(() => {
    if (!form.type) return;
    if (form.type === 'umurenge_kagame') {
      setForm((prev) => ({ ...prev, operatorLevel: 'umurenge' }));
    } else if (form.type === 'inter_universities') {
      setForm((prev) => ({ ...prev, operatorLevel: 'district' }));
    }
  }, [form.type]);

  const Icon = useMemo(() => (form.type === 'umurenge_kagame' ? Trophy : Users), [form.type]);

  // Prefill from initialValues when editing
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      setForm((prev) => ({
        ...prev,
        type: initialValues.type || prev.type || initialTournamentType || '',
        name: initialValues.name || '',
        season: initialValues.season || '',
        location: initialValues.location || '',
        startDate: initialValues.startDate ? initialValues.startDate.slice(0,10) : '',
        endDate: initialValues.endDate ? initialValues.endDate.slice(0,10) : '',
        registrationDeadline: initialValues.registrationDeadline ? initialValues.registrationDeadline.slice(0,10) : '',
        status: initialValues.status || 'upcoming',
        description: initialValues.description || '',
        operatorLevel: initialValues.operatorLevel || prev.operatorLevel,
      }));
      // Parse location into geo if matches pattern
      if (initialValues.location) {
        const parts = String(initialValues.location).split('/').map(s => s.trim());
        if (parts.length >= 2) {
          setGeo({ province: parts[0], district: parts[1], sector: parts[2] || '' });
        }
      }
    }
  }, [mode, initialValues]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Tournament type is required';
    if (!form.name) e.name = 'Name is required';
    if (!form.season) e.season = 'Season is required';
    if (!form.location) e.location = 'Location is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      e.endDate = 'End date must be after start date';
    }
    // Additional validation: if using cascaded selection, require province & district
    if (geo.province || geo.district || geo.sector) {
      if (!geo.province) e.location = 'Province is required';
      else if (!geo.district) e.location = 'District is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix form errors');
      return;
    }
    const payload = {
      ...form,
      currentStage: 'Registration',
    };
    if (mode === 'edit' && initialValues?.id) {
      const updated = await updateTournament(initialValues.id, payload);
      if (updated) {
        toast.success('Tournament updated');
        if (onSuccess) onSuccess(updated);
      }
    } else {
      const created = await createTournament(payload);
      if (created) {
        toast.success('Tournament created');
        if (onSuccess) onSuccess(created);
        // reset but keep type for convenience
        setForm((prev) => ({
          type: prev.type,
          name: '',
          season: '',
          location: '',
          startDate: '',
          endDate: '',
          registrationDeadline: '',
          status: 'upcoming',
          description: '',
          operatorLevel: prev.operatorLevel,
        }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5"/>}
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(!lockTournamentType || mode === 'edit') ? (
              <div>
                <Label htmlFor="type">Tournament Type *</Label>
                <Select value={form.type} onValueChange={(v) => setField('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="umurenge_kagame">Umurenge Kagame Cup</SelectItem>
                    <SelectItem value="inter_universities">Inter-universities</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>
            ) : null}

            <div>
              <Label htmlFor="name">Tournament Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g., Umurenge Kagame Cup 2025"/>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="season">Season *</Label>
              <Select value={form.season} onValueChange={(v) => setField('season', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                  <SelectItem value="2026-2027">2026-2027</SelectItem>
                </SelectContent>
              </Select>
              {errors.season && <p className="text-red-500 text-sm mt-1">{errors.season}</p>}
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              {form.type === 'umurenge_kagame'
                ? 'Football only. Managed at Umurenge (sector) level.'
                : 'All sports except Football. Managed at District/University level.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5"/> Location & Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input id="location" value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Province / District / Sector or City, Country" disabled={true}/>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
            <div>
              <Label htmlFor="registrationDeadline">Registration Deadline</Label>
              <Input id="registrationDeadline" type="date" value={form.registrationDeadline} onChange={(e) => setField('registrationDeadline', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Cascaded Location Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Province</Label>
              <Select value={geo.province} onValueChange={(v) => {
                setGeo({ province: v, district: '', sector: '' });
                setField('location', v);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {locations.provinces.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>District</Label>
              <Select value={geo.district} onValueChange={(v) => {
                const loc = `${geo.province} / ${v}`;
                setGeo((g) => ({ ...g, district: v, sector: '' }));
                setField('location', loc);
              }} disabled={!geo.province}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {(locations.districts[geo.province] || []).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sector (optional)</Label>
              <Select value={geo.sector} onValueChange={(v) => {
                const loc = `${geo.province} / ${geo.district} / ${v}`;
                setGeo((g) => ({ ...g, sector: v }));
                setField('location', loc);
              }} disabled={!geo.district}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {(locations.sectors[geo.district] || []).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5"/> Additional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="operatorLevel">Operator Level</Label>
              <Input id="operatorLevel" value={form.operatorLevel} onChange={(e) => setField('operatorLevel', e.target.value)} disabled/>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Notes about this tournament..."/>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Tournament'}</Button>
      </div>
    </form>
  );
}
