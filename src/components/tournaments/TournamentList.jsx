import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TablePagination } from '../ui/table';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useTournaments } from '../../hooks/useTournaments';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import ResultsRegistrationForm from './ResultsRegistrationForm';
import TournamentCreateForm from './TournamentCreateForm';

const TournamentList = ({ tournaments, loading, error }) => {
  const navigate = useNavigate();
  // When props are not supplied, fall back to the hook to make this component page-ready
  const hook = tournaments === undefined && loading === undefined && error === undefined
    ? useTournaments()
    : null;

  const finalTournaments = hook ? hook.tournaments : (tournaments || []);
  const finalLoading = hook ? hook.loading : loading;
  const finalError = hook ? hook.error : error;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('umurenge_kagame');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [modalTab, setModalTab] = useState('tournament');
  const [modalTabs, setModalTabs] = useState(['tournament']);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewTournament, setViewTournament] = useState(null);
  const [resultsTournament, setResultsTournament] = useState(null);
  const [editTournament, setEditTournament] = useState(null);
  const pageSize = 10;

  // Filter tournaments based on search and filters
  const filteredTournaments = finalTournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || tournament.type === filterType;
    const matchesStatus = filterStatus === 'all' || tournament.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTournaments.length / pageSize));
  const pageSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const pageStart = (pageSafe - 1) * pageSize;
  const pageItems = filteredTournaments.slice(pageStart, pageStart + pageSize);

  const getStatusVariant = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'active': return 'success';
      case 'upcoming': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const deriveStatus = (t) => {
    const raw = (t && t.status) ? String(t.status).toLowerCase() : '';
    if (raw) return raw;
    // Fallback derive from dates
    try {
      const now = new Date();
      const start = t?.startDate ? new Date(t.startDate) : null;
      const end = t?.endDate ? new Date(t.endDate) : null;
      if (start && start > now) return 'upcoming';
      if (end && end < now) return 'completed';
      return 'active';
    } catch {
      return 'active';
    }
  };

  const titleCase = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const getTypeIcon = (type) => {
    return type === 'umurenge_kagame' ? Trophy : Users;
  };

  if (finalLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading tournaments...</span>
      </div>
    );
  }

  if (finalError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Error loading tournaments: {finalError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Tabs + Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={filterType === 'umurenge_kagame' ? 'default' : 'outline'}
            onClick={() => setFilterType('umurenge_kagame')}
            className="rounded-full"
          >
            <Trophy className="w-4 h-4 mr-2" /> Umurenge Kagame Cup
          </Button>
          <Button
            variant={filterType === 'inter_universities' ? 'default' : 'outline'}
            onClick={() => setFilterType('inter_universities')}
            className="rounded-full"
          >
            <Users className="w-4 h-4 mr-2" /> Inter-universities
          </Button>
        </div>
        <div>
          <Button className="flex items-center space-x-2" onClick={() => { setModalTab('tournament'); setModalTabs(['tournament']); setIsRegOpen(true); }}>
            <Plus className="w-4 h-4" />
            <span>{filterType === 'umurenge_kagame' ? 'Create Umurenge Kagame Cup' : 'Create Inter-universities Tournament'}</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tournaments by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="umurenge_kagame">Umurenge Kagame Cup</SelectItem>
                  <SelectItem value="inter_universities">Inter-Universities</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tournament Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTournaments.filter(t => t.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredTournaments.filter(t => t.status === 'upcoming').length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {filteredTournaments.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredTournaments.reduce((sum, t) => sum + (t.playersCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Players</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table View */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Season</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-600">
                    No tournaments found. {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Create your first tournament to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((tournament) => {
                  const TypeIcon = getTypeIcon(tournament.type);
                  const statusText = deriveStatus(tournament);
                  return (
                    <TableRow key={tournament.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                            <TypeIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <div>{tournament.name}</div>
                            <div className="text-xs text-gray-500">{tournament.season}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{tournament.type === 'umurenge_kagame' ? 'Umurenge Kagame Cup' : 'Inter-universities'}</TableCell>
                      <TableCell>{tournament.season}</TableCell>
                      <TableCell>{tournament.location}</TableCell>
                      <TableCell>
                        {tournament.startDate && tournament.endDate ? (
                          `${format(new Date(tournament.startDate), 'MMM dd')} - ${format(new Date(tournament.endDate), 'MMM dd, yyyy')}`
                        ) : '-'}
                      </TableCell>
                      <TableCell>{tournament.playersCount ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(statusText)}>{titleCase(statusText) || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setViewTournament(tournament)}><Eye className="w-4 h-4 mr-1" />View</Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/tournaments/${tournament.id}/players`, { state: { tournament } })}>
                            <Users className="w-4 h-4 mr-1" />Players
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setResultsTournament(tournament); setModalTab('results'); setModalTabs(['results']); setIsRegOpen(true); }}>
                            <Trophy className="w-4 h-4 mr-1" />Results
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setEditTournament(tournament); setModalTab('tournament'); setModalTabs(['tournament']); setIsRegOpen(true); }}>
                            <Edit className="w-4 h-4 mr-1" />Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={pageSafe}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(Math.min(Math.max(p, 1), totalPages))}
          />
        </CardContent>
      </Card>

      {/* Registration Modal */}
      {/* Inline Registration Modal (replaces pages/TournamentRegistration) */}
      <Dialog open={isRegOpen} onOpenChange={(open) => { if (!open) { setIsRegOpen(false); setEditTournament(null); } }}>
        <DialogContent className="max-w-5xl w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {editTournament ? 'Edit Tournament' : 'Tournament Module'}
              </span>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Season 2025-2026</span>
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Render only the requested tab content */}

          {modalTabs.includes('results') && modalTab === 'results' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Results Registration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsRegistrationForm
                  key={resultsTournament?.id || 'no-tournament'}
                  tournamentId={resultsTournament?.id}
                  tournamentType={resultsTournament?.type}
                  season={resultsTournament?.season}
                  province={resultsTournament?.province}
                  district={resultsTournament?.district}
                  sector={resultsTournament?.sector}
                  locationText={resultsTournament?.location}
                  tournamentName={resultsTournament?.name}
                />
              </CardContent>
            </Card>
          )}

          {modalTabs.includes('tournament') && modalTab === 'tournament' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Tournament Registration</span>
                </CardTitle>
                <DialogDescription>
                  Create or update tournament details. All fields marked required must be provided.
                </DialogDescription>
              </CardHeader>
              <CardContent>
                <TournamentCreateForm
                  initialTournamentType={filterType}
                  lockTournamentType={!editTournament}
                  mode={editTournament ? 'edit' : 'create'}
                  initialValues={editTournament || undefined}
                  onSuccess={() => { if (typeof refetch === 'function') refetch(); setIsRegOpen(false); setEditTournament(null); }}
                />
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* View Tournament modal */}
      <Dialog open={!!viewTournament} onOpenChange={(open) => { if (!open) setViewTournament(null); }}>
        <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Tournament</DialogTitle>
            <DialogDescription>Review tournament information and statistics.</DialogDescription>
          </DialogHeader>
          {viewTournament && (
            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="font-medium">{viewTournament.name || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Type</div>
                  <div className="font-medium">{viewTournament.type === 'umurenge_kagame' ? 'Umurenge Kagame Cup' : 'Inter-universities'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Season</div>
                  <div className="font-medium">{viewTournament.season || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="font-medium">{viewTournament.location || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Registration Deadline</div>
                  <div className="font-medium">{viewTournament.registrationDeadline || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Operator Level</div>
                  <div className="font-medium">{viewTournament.operatorLevel || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Start Date</div>
                  <div className="font-medium">{viewTournament.startDate || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">End Date</div>
                  <div className="font-medium">{viewTournament.endDate || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium">
                    <Badge variant={getStatusVariant(deriveStatus(viewTournament))}>{titleCase(deriveStatus(viewTournament))}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Players</div>
                  <div className="font-medium">{viewTournament.playersCount ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Current Stage</div>
                  <div className="font-medium">{viewTournament.currentStage || 'Registration'}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Description</div>
                <div className="font-medium whitespace-pre-wrap">{viewTournament.description || '-'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentList;
